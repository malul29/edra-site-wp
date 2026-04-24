/**
 * lib/wordpress.js
 * WordPress WPGraphQL client for Edra Arsitek Indonesia.
 *
 * Data shape returned by each helper matches the previous Payload CMS shape
 * so that all client components (HomeClient, BlogsClient, etc.) work unchanged.
 *
 * Required WordPress setup:
 *  - Plugin: WPGraphQL
 *  - Plugin: WPGraphQL for Advanced Custom Fields
 *  - Plugin: Advanced Custom Fields (free)
 *  - Plugin: Custom Post Type UI (with "Show in GraphQL" enabled)
 *  - Custom Post Type: "portfolio" (GraphQL plural: "portfolios")
 *  - ACF Field Group for Portfolio (Show in GraphQL enabled):
 *      location (Text), category (Text), year (Text),
 *      description (Textarea), youtube_url (URL)
 *  - Gallery images: use WordPress Gallery Block inside post content
 *  - Featured Image set for main project/blog image
 *
 * Environment variable:
 *  NEXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com
 */

const WP_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_URL ||
  process.env.WORDPRESS_URL ||
  ""
)
  .replace(/\/graphql\/?$/, "") // strip /graphql if accidentally included
  .replace(/\/$/, "");          // strip trailing slash

const GRAPHQL_ENDPOINT = `${WP_BASE_URL}/graphql`;

// ─── GraphQL fetch helper ─────────────────────────────────────────────────────

async function graphqlFetch(query, variables = {}) {
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    next: { revalidate: 60 }, // ISR: re-fetch every 60s in production
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(
      `WPGraphQL error: ${res.status} ${res.statusText} — ${GRAPHQL_ENDPOINT}`
    );
  }

  const json = await res.json();

  if (json.errors && json.errors.length > 0) {
    console.error("[wordpress] GraphQL errors:", json.errors);
    throw new Error(json.errors[0].message);
  }

  return json.data;
}

// ─── GraphQL Queries ──────────────────────────────────────────────────────────

const PORTFOLIO_FIELDS_FRAGMENT = `
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
`;

const GET_PORTFOLIOS = `
  query GetPortfolios($first: Int!) {
    portfolios(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ${PORTFOLIO_FIELDS_FRAGMENT}
      }
    }
  }
`;

const GET_PORTFOLIO_BY_SLUG = `
  query GetPortfolioBySlug($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      ${PORTFOLIO_FIELDS_FRAGMENT}
    }
  }
`;

const GET_PORTFOLIO_BY_ID = `
  query GetPortfolioById($id: ID!) {
    portfolio(id: $id, idType: DATABASE_ID) {
      ${PORTFOLIO_FIELDS_FRAGMENT}
    }
  }
`;

const BLOG_FIELDS_FRAGMENT = `
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
`;

const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int!) {
    posts(first: $first, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        ${BLOG_FIELDS_FRAGMENT}
      }
    }
  }
`;

const GET_BLOG_BY_SLUG = `
  query GetBlogBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      ${BLOG_FIELDS_FRAGMENT}
    }
  }
`;

const GET_BLOG_BY_ID = `
  query GetBlogById($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      ${BLOG_FIELDS_FRAGMENT}
    }
  }
`;

// ─── Media resolver ───────────────────────────────────────────────────────────

/**
 * Extracts the best image URL from a WPGraphQL featuredImage node.
 * Prefers large > medium_large > medium > source_url
 */
function resolveImageUrl(featuredImage) {
  if (!featuredImage?.node) return null;

  const node = featuredImage.node;
  const sizes = node.mediaDetails?.sizes;

  if (sizes && Array.isArray(sizes)) {
    const preferred = ["large", "medium_large", "medium"];
    for (const pref of preferred) {
      const match = sizes.find((s) => s.name === pref);
      if (match?.sourceUrl) return match.sourceUrl;
    }
  }

  return node.sourceUrl || null;
}

/**
 * Extracts a full-size image URL from a WPGraphQL featuredImage node.
 */
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

// ─── Gallery parser ───────────────────────────────────────────────────────────

/**
 * Parses gallery image URLs from WordPress post content HTML.
 * Works with the WordPress Gallery Block and individual Image blocks.
 *
 * Extracts src attributes from <img> tags that are inside
 * wp-block-gallery or wp-block-image figures.
 */
function parseGalleryFromContent(contentHtml) {
  if (!contentHtml) return [];

  // Match all <img> src attributes in the content
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const urls = [];
  let match;

  while ((match = imgRegex.exec(contentHtml)) !== null) {
    const url = match[1];
    if (url && !urls.includes(url)) {
      urls.push(url);
    }
  }

  return urls.map((url) => ({ image: url }));
}

// ─── Portfolio normalizer ─────────────────────────────────────────────────────

/**
 * Normalizes a single WPGraphQL portfolio node to match the Payload CMS shape.
 *
 * Output shape:
 *   { id, slug, title, location, category, year, description, image, gallery, youtubeUrl }
 */
function normalizePortfolio(node) {
  const acf = node.portofolioFields || {};

  // Gallery: parse from content HTML (Gallery Block)
  const gallery = parseGalleryFromContent(node.content);

  // Main image from featured media
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

// ─── Blog normalizer ──────────────────────────────────────────────────────────

/**
 * Normalizes a WPGraphQL post node to match the Payload CMS blog shape.
 *
 * Output shape:
 *   { id, slug, title, subtitle, date, tag, image, imageFull, excerpt, author, content }
 */
function normalizeBlog(node) {
  const imageUrl = resolveImageUrl(node.featuredImage);
  const imageUrlFull = resolveImageUrlFull(node.featuredImage) || imageUrl;

  const authorName = node.author?.node?.name || "";

  // Date: format to readable string (e.g., "Apr 2026")
  const rawDate = node.date || "";
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "";

  // Tag: from first category
  const tag = node.categories?.nodes?.[0]?.name || "Architecture";

  return {
    id: node.databaseId,
    slug: node.slug,
    title: node.title || node.slug,
    subtitle: "",
    date: formattedDate,
    tag,
    image: imageUrl,
    imageFull: imageUrlFull,
    excerpt: stripHtmlTags(node.excerpt || ""),
    author: authorName,
    content: node.content || "",
  };
}

// ─── Utilities ────────────────────────────────────────────────────────────────

function stripHtmlTags(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetch all portfolio projects.
 * @param {object} opts
 * @param {number} [opts.limit=100]
 * @returns {Promise<Array>}
 */
export async function getPortfolioProjects({ limit = 100 } = {}) {
  try {
    const data = await graphqlFetch(GET_PORTFOLIOS, { first: limit });
    const nodes = data?.portfolios?.nodes || [];
    return nodes.map(normalizePortfolio);
  } catch (err) {
    console.error("[wordpress] getPortfolioProjects failed:", err?.message);
    return [];
  }
}

/**
 * Fetch a single portfolio project by slug or numeric ID.
 * @param {string|number} slugOrId
 * @returns {Promise<object|null>}
 */
export async function getPortfolioBySlug(slugOrId) {
  try {
    // Try slug first
    const bySlug = await graphqlFetch(GET_PORTFOLIO_BY_SLUG, {
      slug: String(slugOrId),
    });
    if (bySlug?.portfolio) {
      return normalizePortfolio(bySlug.portfolio);
    }

    // Fallback: numeric ID
    if (!isNaN(slugOrId)) {
      const byId = await graphqlFetch(GET_PORTFOLIO_BY_ID, {
        id: String(slugOrId),
      });
      if (byId?.portfolio) {
        return normalizePortfolio(byId.portfolio);
      }
    }

    return null;
  } catch (err) {
    console.error("[wordpress] getPortfolioBySlug failed:", err?.message);
    return null;
  }
}

/**
 * Fetch all blog posts.
 * @param {object} opts
 * @param {number} [opts.limit=50]
 * @returns {Promise<Array>}
 */
export async function getBlogPosts({ limit = 50 } = {}) {
  try {
    const data = await graphqlFetch(GET_BLOG_POSTS, { first: limit });
    const nodes = data?.posts?.nodes || [];
    return nodes.map(normalizeBlog);
  } catch (err) {
    console.error("[wordpress] getBlogPosts failed:", err?.message);
    return [];
  }
}

/**
 * Fetch a single blog post by slug or numeric ID.
 * @param {string|number} slugOrId
 * @returns {Promise<object|null>}
 */
export async function getBlogBySlug(slugOrId) {
  try {
    // Try slug first
    const bySlug = await graphqlFetch(GET_BLOG_BY_SLUG, {
      slug: String(slugOrId),
    });
    if (bySlug?.post) {
      return normalizeBlog(bySlug.post);
    }

    // Fallback: numeric ID
    if (!isNaN(slugOrId)) {
      const byId = await graphqlFetch(GET_BLOG_BY_ID, {
        id: String(slugOrId),
      });
      if (byId?.post) {
        return normalizeBlog(byId.post);
      }
    }

    return null;
  } catch (err) {
    console.error("[wordpress] getBlogBySlug failed:", err?.message);
    return null;
  }
}

/**
 * Returns the configured WordPress base URL (useful for debugging).
 */
export function getWpBaseUrl() {
  return WP_BASE_URL;
}
