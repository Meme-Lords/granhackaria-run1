import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchImageUrlFromPage } from "../fetch-event-image";

describe("fetchImageUrlFromPage", () => {
  const mockFetch = vi.fn();
  beforeEach(() => {
    mockFetch.mockReset();
    vi.stubGlobal("fetch", mockFetch);
  });

  it("returns og:image content when present (property before content)", async () => {
    const html = `
      <head>
        <meta property="og:image" content="https://example.com/event-cover.jpg">
      </head>
    `;
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(html) });

    const result = await fetchImageUrlFromPage("https://meetup.com/e/123/");

    expect(result).toBe("https://example.com/event-cover.jpg");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe("https://meetup.com/e/123/");
  });

  it("returns og:image when content comes before property", async () => {
    const html = `<meta content="https://cdn.example/photo.png" property="og:image">`;
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(html) });

    const result = await fetchImageUrlFromPage("https://example.com/event");

    expect(result).toBe("https://cdn.example/photo.png");
  });

  it("returns twitter:image when og:image missing", async () => {
    const html = `<meta property="twitter:image" content="https://twitter.com/img/1.jpg">`;
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(html) });

    const result = await fetchImageUrlFromPage("https://example.com/e");

    expect(result).toBe("https://twitter.com/img/1.jpg");
  });

  it("resolves relative image URL against page URL", async () => {
    const html = `<meta property="og:image" content="/images/cover.jpg">`;
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(html) });

    const result = await fetchImageUrlFromPage("https://meetup.com/group/events/123/");

    expect(result).toBe("https://meetup.com/images/cover.jpg");
  });

  it("returns null when no og:image or twitter:image", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve("<html><body></body></html>") });

    const result = await fetchImageUrlFromPage("https://example.com/page");

    expect(result).toBeNull();
  });

  it("returns null when response is not ok", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await fetchImageUrlFromPage("https://example.com/missing");

    expect(result).toBeNull();
  });

  it("returns null on fetch error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await fetchImageUrlFromPage("https://example.com/event");

    expect(result).toBeNull();
  });

  it("uses custom timeout when provided", async () => {
    const html = `<meta property="og:image" content="https://img.example/1.jpg">`;
    mockFetch.mockResolvedValueOnce({ ok: true, text: () => Promise.resolve(html) });

    await fetchImageUrlFromPage("https://example.com/e", { timeoutMs: 5000 });

    expect(mockFetch).toHaveBeenCalledWith(
      "https://example.com/e",
      expect.objectContaining({
        signal: expect.any(AbortSignal),
        headers: expect.objectContaining({ "User-Agent": expect.any(String) }),
      })
    );
  });
});
