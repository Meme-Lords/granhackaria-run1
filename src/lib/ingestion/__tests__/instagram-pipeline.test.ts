import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock("../instagram", () => ({
  fetchAccountPosts: vi.fn(),
}));

vi.mock("../parser", () => ({
  parseEventFromText: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

import { ingestFromInstagram } from "../instagram-pipeline";
import { fetchAccountPosts } from "../instagram";
import { parseEventFromText } from "../parser";

const mockFetchAccountPosts = vi.mocked(fetchAccountPosts);
const mockParseEventFromText = vi.mocked(parseEventFromText);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
});

describe("ingestFromInstagram", () => {
  it("processes posts from multiple accounts", async () => {
    mockFetchAccountPosts
      .mockResolvedValueOnce([
        {
          id: "1",
          caption: "Concert tonight!",
          image_url: "https://img.example.com/1.jpg",
          permalink: "https://instagram.com/p/A/",
          timestamp: "2026-01-31T00:00:00Z",
          username: "account1",
        },
      ])
      .mockResolvedValueOnce([
        {
          id: "2",
          caption: "Art show this weekend",
          image_url: "https://img.example.com/2.jpg",
          permalink: "https://instagram.com/p/B/",
          timestamp: "2026-01-31T00:00:00Z",
          username: "account2",
        },
      ]);

    mockParseEventFromText.mockResolvedValue({
      title: "Test Event",
      description: null,
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/A/",
    });

    mockUpsert.mockResolvedValue({ error: null });

    const result = await ingestFromInstagram(["account1", "account2"]);

    expect(mockFetchAccountPosts).toHaveBeenCalledTimes(2);
    expect(mockParseEventFromText).toHaveBeenCalledTimes(2);
    expect(result.inserted).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it("skips posts without captions", async () => {
    mockFetchAccountPosts.mockResolvedValueOnce([
      {
        id: "1",
        caption: null,
        image_url: "https://img.example.com/1.jpg",
        permalink: "https://instagram.com/p/A/",
        timestamp: "2026-01-31T00:00:00Z",
        username: "account1",
      },
    ]);

    const result = await ingestFromInstagram(["account1"]);

    expect(mockParseEventFromText).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
  });

  it("skips posts that are not events", async () => {
    mockFetchAccountPosts.mockResolvedValueOnce([
      {
        id: "1",
        caption: "Beautiful sunset!",
        image_url: "https://img.example.com/1.jpg",
        permalink: "https://instagram.com/p/A/",
        timestamp: "2026-01-31T00:00:00Z",
        username: "account1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce(null);

    const result = await ingestFromInstagram(["account1"]);

    expect(result.skipped).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("counts database errors", async () => {
    mockFetchAccountPosts.mockResolvedValueOnce([
      {
        id: "1",
        caption: "Concert tonight!",
        image_url: null,
        permalink: "https://instagram.com/p/A/",
        timestamp: "2026-01-31T00:00:00Z",
        username: "account1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce({
      title: "Test Event",
      description: null,
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      category: "music",
      image_url: null,
      source: "instagram",
      source_url: "https://instagram.com/p/A/",
    });

    mockUpsert.mockResolvedValueOnce({
      error: { message: "constraint violation" },
    });

    const result = await ingestFromInstagram(["account1"]);

    expect(result.errors).toBe(1);
    expect(result.inserted).toBe(0);
  });
});
