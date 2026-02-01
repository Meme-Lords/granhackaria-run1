/**
 * Fetch event page HTML and extract og:image (or twitter:image) URL.
 * Used as fallback when the event source does not provide image_url.
 */

const DEFAULT_TIMEOUT_MS = 8_000;

/** Match <meta property="og:image" content="..."> or content then property. */
const OG_IMAGE_REGEXES = [
  /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
  /<meta[^>]+property=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']twitter:image["']/i,
];

function extractOgImageUrl(html: string): string | null {
  for (const re of OG_IMAGE_REGEXES) {
    const m = html.match(re);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return null;
}

/**
 * Fetch a page URL and return the og:image (or twitter:image) meta content, or null.
 * Resolves relative image URLs against the page URL. Uses a timeout to avoid hanging.
 */
export async function fetchImageUrlFromPage(
  pageUrl: string,
  options?: { timeoutMs?: number }
): Promise<string | null> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(pageUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GranHackariaBot/1.0; +https://github.com/Meme-Lords/granhackaria-run1)",
      },
      redirect: "follow",
    });
    clearTimeout(timeoutId);
    if (!res.ok) return null;
    const html = await res.text();
    const raw = extractOgImageUrl(html);
    if (!raw) return null;
    try {
      return new URL(raw, pageUrl).href;
    } catch {
      return raw.startsWith("http") ? raw : null;
    }
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}
