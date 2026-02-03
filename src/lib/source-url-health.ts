/**
 * Check whether a source URL is permanently gone (404/410).
 * Used to hide events whose source page no longer exists.
 */

const DEFAULT_TIMEOUT_MS = 8_000;

export type SourceUrlStatus = "ok" | "gone" | "error";

/** HTTP status codes that mean the resource is permanently gone. */
const GONE_STATUS_CODES = [404, 410];

/**
 * Check a URL with HEAD request. Returns:
 * - "gone": 404 or 410 — hide event from list.
 * - "ok": 2xx — URL is reachable.
 * - "error": 5xx, other 4xx, timeouts, network errors — keep event, don't mark as gone.
 */
export async function checkSourceUrlStatus(
  url: string,
  options?: { timeoutMs?: number }
): Promise<SourceUrlStatus> {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; GranHackariaBot/1.0; +https://github.com/Meme-Lords/granhackaria-run1)",
      },
      redirect: "follow",
    });
    clearTimeout(timeoutId);

    if (GONE_STATUS_CODES.includes(res.status)) {
      return "gone";
    }
    if (res.ok) {
      return "ok";
    }
    return "error";
  } catch {
    clearTimeout(timeoutId);
    return "error";
  }
}

/**
 * Returns true only when the URL returns 404 or 410 (permanently gone).
 */
export async function isSourceUrlGone(
  url: string,
  options?: { timeoutMs?: number }
): Promise<boolean> {
  const status = await checkSourceUrlStatus(url, options);
  return status === "gone";
}
