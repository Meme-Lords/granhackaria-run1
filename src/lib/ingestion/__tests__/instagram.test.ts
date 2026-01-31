import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAccountPosts } from "../instagram";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RAPIDAPI_KEY", "test-key");
});

describe("fetchAccountPosts", () => {
  it("returns parsed posts from the API response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: "123",
              caption: { text: "Concert tonight!" },
              image_versions2: { candidates: [{ url: "https://img.example.com/1.jpg" }] },
              code: "ABC123",
              taken_at: 1706745600,
            },
            {
              id: "456",
              caption: { text: "Art show this weekend" },
              image_versions2: { candidates: [{ url: "https://img.example.com/2.jpg" }] },
              code: "DEF456",
              taken_at: 1706832000,
            },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(2);
    expect(posts[0]).toEqual({
      id: "123",
      caption: "Concert tonight!",
      image_url: "https://img.example.com/1.jpg",
      permalink: "https://www.instagram.com/p/ABC123/",
      timestamp: expect.any(String),
      username: "testuser",
    });
  });

  it("returns empty array when RAPIDAPI_KEY is not set", async () => {
    vi.stubEnv("RAPIDAPI_KEY", "");

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toEqual([]);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns empty array on API error", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: "Too Many Requests",
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toEqual([]);
  });

  it("returns empty array on network error", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toEqual([]);
  });

  it("handles posts with missing caption", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: "789",
              code: "GHI789",
              taken_at: 1706745600,
            },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts[0].caption).toBeNull();
    expect(posts[0].image_url).toBeNull();
  });

  it("respects the count parameter", async () => {
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      caption: { text: `Post ${i}` },
      code: `CODE${i}`,
      taken_at: 1706745600 + i,
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { items } }),
    });

    const posts = await fetchAccountPosts("testuser", 5);

    expect(posts).toHaveLength(5);
  });
});
