const FALLBACK_MEDIA_URL = "/edra-logo.png";

/**
 * Normalizes a media URL for display.
 * WordPress returns absolute URLs (https://...) for all media,
 * so this function mainly handles fallbacks and edge cases.
 */
export function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return FALLBACK_MEDIA_URL;

  // Absolute URLs from WordPress — use as-is
  if (/^https?:\/\//i.test(url)) return url;

  const cleaned = String(url).trim();

  // Local paths (e.g., /uploads/..., /media/...)
  if (cleaned.startsWith("/")) return cleaned;

  // Bare filename — prefix with /
  return `/${cleaned}`;
}

/**
 * Resolves a media value to a display URL.
 * Handles strings (URLs), objects (WordPress media), and fallbacks.
 *
 * @param {string|object|number} media - URL string, media object, or ID
 * @returns {string} Resolved URL
 */
export function resolveMediaUrl(media) {
  if (!media) return FALLBACK_MEDIA_URL;

  // Direct URL string
  if (typeof media === "string") {
    return normalizeMediaUrl(media);
  }

  // Numeric ID — can't resolve without API call, use fallback
  if (typeof media === "number") {
    return FALLBACK_MEDIA_URL;
  }

  // WordPress media object
  if (typeof media === "object") {
    const candidate =
      media.sourceUrl ||
      media.source_url ||
      media.url ||
      media.filename;
    if (candidate) return normalizeMediaUrl(candidate);

    // Try sizes
    const sizes = media?.mediaDetails?.sizes || media?.sizes;
    if (sizes) {
      // WordPress GraphQL sizes (array)
      if (Array.isArray(sizes)) {
        const preferred = sizes.find((s) => s.name === "1536x1536") ||
          sizes.find((s) => s.name === "large") ||
          sizes.find((s) => s.name === "medium_large") ||
          sizes.find((s) => s.name === "medium") ||
          sizes[0];
        if (preferred?.sourceUrl) return preferred.sourceUrl;
      }
      // WordPress REST sizes (object)
      const sizeUrl =
        sizes.full?.source_url ||
        sizes.large?.source_url ||
        sizes.medium?.source_url ||
        sizes.thumbnail?.source_url;
      if (sizeUrl) return normalizeMediaUrl(sizeUrl);
    }

    return FALLBACK_MEDIA_URL;
  }

  return FALLBACK_MEDIA_URL;
}

/**
 * Resolve a media value to a preferred image size.
 * For WordPress, images are already optimized via srcset,
 * so this mainly returns the best available URL.
 *
 * @param {object|string|number} media - Media value
 * @param {'thumbnail'|'medium'|'large'|'full'} preferredSize - Preferred size
 * @returns {string} Resolved URL
 */
export function resolveMediaUrlForSize(media, preferredSize = "large") {
  // Simple values — just resolve normally
  if (!media || typeof media !== "object") return resolveMediaUrl(media);

  // WordPress GraphQL featured image node
  if (media.node) {
    return media.node.sourceUrl || resolveMediaUrl(media);
  }

  // WordPress media with sizes
  const sizes = media.mediaDetails?.sizes || media.sizes;
  if (sizes) {
    if (Array.isArray(sizes)) {
      const match = sizes.find((s) => s.name === preferredSize);
      if (match?.sourceUrl) return match.sourceUrl;
    } else if (sizes[preferredSize]?.source_url) {
      return sizes[preferredSize].source_url;
    }
  }

  // Fall back to source URL or general resolve
  return media.sourceUrl || media.source_url || resolveMediaUrl(media);
}
