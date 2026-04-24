import { useState, useEffect } from "react";

/**
 * WordPress WPGraphQL client hook for client-side data fetching.
 * Uses GraphQL POST requests instead of REST API GET requests.
 */
const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL || ""
)
  .replace(/\/graphql\/?$/, "")
  .replace(/\/$/, "");

const GRAPHQL_ENDPOINT = `${WP_BASE_URL}/graphql`;

// Module-level in-memory cache: persists across component mounts for the session
const _cache = new Map();   // endpoint → data
const _pending = new Map(); // endpoint → Promise (dedup concurrent requests)

// ─── GraphQL Queries ──────────────────────────────────────────────────────────

const PORTFOLIO_QUERY = `
  query GetPortfolios {
    portfolios(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        slug
        title
        content
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              sizes {
                name
                sourceUrl
              }
            }
          }
        }
        portofolioFields {
          location
          category
          year
          description
          youtubeUrl
          siteArea
          buildingArea
          projectType
          service
        }
      }
    }
  }
`;

const BLOG_QUERY = `
  query GetBlogPosts {
    posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        slug
        title
        date
        content
        excerpt
        author {
          node {
            name
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaDetails {
              sizes {
                name
                sourceUrl
              }
            }
          }
        }
        categories {
          nodes {
            name
          }
        }
      }
    }
  }
`;

// ─── Normalizers ──────────────────────────────────────────────────────────────

function resolveImageUrl(featuredImage) {
  if (!featuredImage?.node) return null;
  const node = featuredImage.node;
  const sizes = node.mediaDetails?.sizes;
  if (sizes && Array.isArray(sizes)) {
    for (const pref of ["large", "medium_large", "medium"]) {
      const match = sizes.find((s) => s.name === pref);
      if (match?.sourceUrl) return match.sourceUrl;
    }
  }
  return node.sourceUrl || null;
}

function resolveImageUrlFull(featuredImage) {
  if (!featuredImage?.node) return null;
  const node = featuredImage.node;
  const sizes = node.mediaDetails?.sizes;
  if (sizes && Array.isArray(sizes)) {
    const match = sizes.find((s) => s.name === "2048x2048") || sizes.find((s) => s.name === "1536x1536");
    if (match?.sourceUrl) return match.sourceUrl;
  }
  return node.sourceUrl || null;
}

function parseGalleryFromContent(contentHtml) {
  if (!contentHtml) return [];
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls = [];
  let match;
  while ((match = imgRegex.exec(contentHtml)) !== null) {
    const url = match[1];
    if (url && !urls.includes(url)) urls.push(url);
  }
  return urls.map((url) => ({ image: url }));
}

function normalizePortfolioItem(node) {
  const acf = node.portofolioFields || {};
  const gallery = parseGalleryFromContent(node.content);
  
  let imageUrl = resolveImageUrl(node.featuredImage);
  if (!imageUrl && gallery.length > 0) {
    imageUrl = gallery[0].image;
  }

  let imageUrlFull = resolveImageUrlFull(node.featuredImage);
  if (!imageUrlFull && gallery.length > 0) {
    imageUrlFull = gallery[0].image;
  }

  return {
    id: node.databaseId,
    slug: node.slug,
    title: node.title || node.slug,
    location: acf.location || "",
    category: acf.category || "",
    year: acf.year || "",
    siteArea: acf.siteArea || "",
    buildingArea: acf.buildingArea || "",
    projectType: acf.projectType || "",
    service: acf.service || "",
    description: acf.description || stripHtmlTags(node.content || ""),
    image: imageUrl,
    imageFull: imageUrlFull || imageUrl,
    gallery,
    youtubeUrl: acf.youtubeUrl || "",
  };
}

function normalizeBlogItem(node) {
  const imageUrl = resolveImageUrl(node.featuredImage);
  const authorName = node.author?.node?.name || "";
  const rawDate = node.date || "";
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  return {
    id: node.databaseId,
    slug: node.slug,
    title: node.title || node.slug,
    subtitle: "",
    date: formattedDate,
    tag: node.categories?.nodes?.[0]?.name || "Architecture",
    image: imageUrl,
    excerpt: stripHtmlTags(node.excerpt || ""),
    author: authorName,
    content: node.content || "",
  };
}

function stripHtmlTags(html) {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ─── GraphQL fetch helper ─────────────────────────────────────────────────────

function resolveGraphQLQuery(endpoint) {
  const clean = endpoint.replace(/^\/+/, "");
  if (clean === "portfolio" || clean.startsWith("portfolio")) {
    return { query: PORTFOLIO_QUERY, type: "portfolio" };
  }
  if (clean === "blogs" || clean === "posts" || clean.startsWith("posts")) {
    return { query: BLOG_QUERY, type: "blog" };
  }
  // Default to portfolio
  return { query: PORTFOLIO_QUERY, type: "portfolio" };
}

function normalizeGraphQLResponse(data, type) {
  if (type === "blog") {
    const nodes = data?.posts?.nodes || [];
    return nodes.map(normalizeBlogItem);
  }
  // portfolio
  const nodes = data?.portfolios?.nodes || [];
  return nodes.map(normalizePortfolioItem);
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useApi(endpoint) {
  const isPortfolioEndpoint = /portfolio/i.test(endpoint);
  const canUseMemoryCache = !isPortfolioEndpoint;

  const [data, setData] = useState(
    (canUseMemoryCache ? _cache.get(endpoint) : null) ?? []
  );
  const [loading, setLoading] = useState(
    !(canUseMemoryCache && _cache.has(endpoint))
  );
  const [error, setError] = useState(null);

  const fetchData = (force = false) => {
    if (canUseMemoryCache && !force && _cache.has(endpoint)) {
      setData(_cache.get(endpoint));
      setLoading(false);
      return;
    }

    setLoading(true);

    if (!_pending.has(endpoint)) {
      const { query, type } = resolveGraphQLQuery(endpoint);

      const promise = fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query }),
      })
        .then((r) => {
          if (!r.ok) throw new Error(r.statusText);
          return r.json();
        })
        .then((json) => {
          if (json.errors && json.errors.length > 0) {
            console.error("[useApi] GraphQL errors:", json.errors);
            throw new Error(json.errors[0].message);
          }
          const normalized = normalizeGraphQLResponse(json.data, type);
          if (canUseMemoryCache) {
            _cache.set(endpoint, normalized);
          }
          _pending.delete(endpoint);
          return normalized;
        })
        .catch((e) => {
          _pending.delete(endpoint);
          throw e;
        });

      _pending.set(endpoint, promise);
    }

    _pending
      .get(endpoint)
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint]);

  const refetch = () => {
    if (canUseMemoryCache) {
      _cache.delete(endpoint);
    }
    fetchData(true);
  };

  return { data, loading, error, refetch };
}

export async function apiPost(endpoint, body) {
  // For contact form, POST to our own Next.js API route (not WordPress)
  const res = await fetch(`/api${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiDelete(endpoint, id) {
  const res = await fetch(`/api${endpoint}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPut(endpoint, id, body) {
  const res = await fetch(`/api${endpoint}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
