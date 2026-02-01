import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchAccountPosts } from "../instagram";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("RAPIDAPI_KEY", "test-key");
});

// Posts must have taken_at within last 2 days to pass the filter
const recentTakenAt = () => Math.floor(Date.now() / 1000) - 3600; // 1 hour ago

describe("fetchAccountPosts", () => {
  it("returns parsed posts from the API response", async () => {
    const oneHourAgo = recentTakenAt();
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
              taken_at: oneHourAgo,
            },
            {
              id: "456",
              caption: { text: "Art show this weekend" },
              image_versions2: { candidates: [{ url: "https://img.example.com/2.jpg" }] },
              code: "DEF456",
              taken_at: oneHourAgo - 3600,
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
              taken_at: recentTakenAt(),
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
    const baseTime = recentTakenAt();
    const items = Array.from({ length: 20 }, (_, i) => ({
      id: String(i),
      caption: { text: `Post ${i}` },
      code: `CODE${i}`,
      taken_at: baseTime - i,
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { items } }),
    });

    const posts = await fetchAccountPosts("testuser", 5);

    expect(posts).toHaveLength(5);
  });

  it("filters out posts older than POSTS_DAYS_BACK", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const fourDaysAgo = nowSec - 4 * 24 * 60 * 60;
    const oneDayAgo = nowSec - 1 * 24 * 60 * 60;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            { id: "old", caption: { text: "Old" }, code: "OLD", taken_at: fourDaysAgo },
            { id: "recent", caption: { text: "Recent" }, code: "REC", taken_at: oneDayAgo },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].id).toBe("recent");
  });

  it("handles timestamp as ISO string", async () => {
    const oneHourAgo = new Date(Date.now() - 3600 * 1000).toISOString();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: "1",
              caption: { text: "Event" },
              code: "ABC",
              created_at: oneHourAgo,
            },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("Event");
    expect(posts[0].timestamp).toBeDefined();
  });

  it("warns when all posts are older than POSTS_DAYS_BACK", async () => {
    const nowSec = Math.floor(Date.now() / 1000);
    const fiveDaysAgo = nowSec - 5 * 24 * 60 * 60;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            { id: "old1", caption: { text: "Old" }, code: "O1", taken_at: fiveDaysAgo },
            { id: "old2", caption: { text: "Older" }, code: "O2", taken_at: fiveDaysAgo - 86400 },
          ],
        },
      }),
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("none in last 3 days")
    );

    warnSpy.mockRestore();
  });

  it("warns when API returns empty posts but response has keys", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: { items: [] },
        meta: { total: 0 },
      }),
    });

    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("API returned 0 posts")
    );

    warnSpy.mockRestore();
  });

  it("parses result as array (Instagram120 style)", async () => {
    const oneHourAgo = recentTakenAt();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: [
          {
            id: "r1",
            caption: { text: "From result array" },
            code: "R1",
            taken_at: oneHourAgo,
          },
        ],
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("From result array");
  });

  it("parses result.edges GraphQL style", async () => {
    const oneHourAgo = recentTakenAt();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          edges: [
            { node: { id: "e1", caption: { text: "Edge node" }, code: "E1", taken_at: oneHourAgo } },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("Edge node");
  });

  it("parses result.items when result is object", async () => {
    const oneHourAgo = recentTakenAt();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        result: {
          items: [
            { id: "i1", caption: { text: "From result.items" }, code: "I1", taken_at: oneHourAgo },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("From result.items");
  });

  it("parses data.edge_owner_to_timeline_media.edges", async () => {
    const oneHourAgo = recentTakenAt();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          edge_owner_to_timeline_media: {
            edges: [
              {
                node: {
                  id: "n1",
                  caption: { text: "GraphQL media" },
                  code: "N1",
                  taken_at: oneHourAgo,
                },
              },
            ],
          },
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("GraphQL media");
  });

  it("parses data.user.edge_owner_to_timeline_media.edges", async () => {
    const oneHourAgo = recentTakenAt();
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          user: {
            edge_owner_to_timeline_media: {
              edges: [
                {
                  node: {
                    id: "u1",
                    caption: { text: "User timeline" },
                    code: "U1",
                    taken_at: oneHourAgo,
                  },
                },
              ],
            },
          },
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("User timeline");
  });

  it("handles timestamp in milliseconds", async () => {
    const oneHourAgoMs = Date.now() - 3600 * 1000;
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: "1",
              caption: { text: "Ms timestamp" },
              code: "MS",
              taken_at: oneHourAgoMs,
            },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(1);
    expect(posts[0].caption).toBe("Ms timestamp");
  });

  it("handles invalid date string in timestamp", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          items: [
            {
              id: "1",
              caption: { text: "Bad date" },
              code: "BD",
              taken_at: "not-a-date",
            },
          ],
        },
      }),
    });

    const posts = await fetchAccountPosts("testuser");

    expect(posts).toHaveLength(0);
  });
});
