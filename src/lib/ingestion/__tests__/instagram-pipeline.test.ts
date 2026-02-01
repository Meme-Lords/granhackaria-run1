import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockInsert } = vi.hoisted(() => ({
  mockInsert: vi.fn(),
}));

vi.mock("dotenv", () => ({ config: vi.fn() }));

vi.mock("../instagram", () => ({
  fetchAccountPosts: vi.fn(),
}));

vi.mock("../parser", () => ({
  parseEventFromText: vi.fn(),
  parseEventFromImage: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      insert: mockInsert,
    }),
  }),
}));

import { ingestFromInstagram } from "../instagram-pipeline";
import { fetchAccountPosts } from "../instagram";
import { parseEventFromText, parseEventFromImage } from "../parser";

const mockFetchAccountPosts = vi.mocked(fetchAccountPosts);
const mockParseEventFromText = vi.mocked(parseEventFromText);
const mockParseEventFromImage = vi.mocked(parseEventFromImage);

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
      title_en: "Test Event",
      title_es: "Evento de Prueba",
      description: null,
      description_en: null,
      description_es: null,
      source_language: "en",
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      ticket_price: null,
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/A/",
    });

    mockInsert.mockResolvedValue({ error: null });

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
    mockParseEventFromImage.mockResolvedValueOnce(null);

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
      title_en: "Test Event",
      title_es: "Evento de Prueba",
      description: null,
      description_en: null,
      description_es: null,
      source_language: "en",
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      ticket_price: null,
      category: "music",
      image_url: null,
      source: "instagram",
      source_url: "https://instagram.com/p/A/",
    });

    mockInsert.mockResolvedValueOnce({
      error: { message: "constraint violation", code: "OTHER" },
    });

    const result = await ingestFromInstagram(["account1"]);

    expect(result.errors).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("counts skipped when insert returns 23505 duplicate", async () => {
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
      title_en: "Test Event",
      title_es: "Evento de Prueba",
      description: null,
      description_en: null,
      description_es: null,
      source_language: "en",
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      ticket_price: null,
      category: "music",
      image_url: null,
      source: "instagram",
      source_url: "https://instagram.com/p/A/",
    });

    mockInsert.mockResolvedValueOnce({
      error: { message: "duplicate key value", code: "23505" },
    });

    const result = await ingestFromInstagram(["account1"]);

    expect(result.skipped).toBe(1);
    expect(result.errors).toBe(0);
    expect(result.inserted).toBe(0);
  });

  it("throws when Supabase env is missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    await expect(ingestFromInstagram(["account1"])).rejects.toThrow(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY"
    );
    expect(mockFetchAccountPosts).not.toHaveBeenCalled();
  });

  it("uses vision when caption is not an event but post has image", async () => {
    mockFetchAccountPosts.mockResolvedValueOnce([
      {
        id: "1",
        caption: "Beautiful sunset!",
        image_url: "https://img.example.com/1.jpg",
        permalink: "https://instagram.com/p/V/",
        timestamp: "2026-01-31T00:00:00Z",
        username: "account1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce(null);
    mockParseEventFromImage.mockResolvedValueOnce({
      title: "Poster Event",
      title_en: "Poster Event",
      title_es: "Evento del Póster",
      description: "From poster",
      description_en: "From poster",
      description_es: "Del póster",
      source_language: "en",
      date_start: "2026-03-01",
      time: "20:00",
      location: "Auditorio",
      ticket_price: "Free",
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/V/",
    });

    mockInsert.mockResolvedValue({ error: null });

    const result = await ingestFromInstagram(["account1"]);

    expect(mockParseEventFromText).toHaveBeenCalledTimes(1);
    expect(mockParseEventFromImage).toHaveBeenCalledWith(
      "https://img.example.com/1.jpg",
      "Beautiful sunset!",
      "instagram",
      "https://instagram.com/p/V/"
    );
    expect(result.inserted).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it("merges vision into event when caption event has missing required fields", async () => {
    mockFetchAccountPosts.mockResolvedValueOnce([
      {
        id: "1",
        caption: "Concert soon!",
        image_url: "https://img.example.com/1.jpg",
        permalink: "https://instagram.com/p/M/",
        timestamp: "2026-01-31T00:00:00Z",
        username: "account1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce({
      title: "Concert",
      title_en: "Concert",
      title_es: "Concierto",
      description: null,
      description_en: null,
      description_es: null,
      source_language: "en",
      date_start: "",
      time: null,
      location: "TBD",
      ticket_price: null,
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/M/",
    });

    mockParseEventFromImage.mockResolvedValueOnce({
      title: "Concert",
      title_en: "Concert",
      title_es: "Concierto",
      description: "Live music night",
      description_en: "Live music night",
      description_es: "Noche de música en vivo",
      source_language: "en",
      date_start: "2026-04-15",
      time: "21:00",
      location: "TBD",
      ticket_price: "15€",
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/M/",
    });

    mockInsert.mockResolvedValue({ error: null });

    const result = await ingestFromInstagram(["account1"]);

    expect(mockParseEventFromImage).toHaveBeenCalledWith(
      "https://img.example.com/1.jpg",
      "Concert soon!",
      "instagram",
      "https://instagram.com/p/M/"
    );
    expect(result.inserted).toBe(1);
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Concert",
        title_en: "Concert",
        title_es: "Concierto",
        description: "Live music night",
        description_en: "Live music night",
        description_es: "Noche de música en vivo",
        date_start: "2026-04-15",
        time: "21:00",
        ticket_price: "15€",
      })
    );
  });

  it("runs CLI block when executed as main module", async () => {
    const origArgv = process.argv.slice();
    process.argv[1] = "/path/to/instagram-pipeline.ts";

    vi.stubEnv("INSTAGRAM_ACCOUNTS", "acc1");
    vi.stubEnv("RAPIDAPI_KEY", "rapid-key");
    vi.stubEnv("ANTHROPIC_API_KEY", "anthropic-key");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://cli-test.supabase.co");
    vi.stubEnv("SUPABASE_SECRET_KEY", "service-key");

    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mockFetchAccountPosts.mockResolvedValue([]);
    mockInsert.mockResolvedValue({ error: null });

    vi.resetModules();
    await import("../instagram-pipeline");
    await new Promise((r) => setImmediate(r));

    expect(exitSpy).not.toHaveBeenCalledWith(1);
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining("Done!"));

    process.argv = origArgv;
    exitSpy.mockRestore();
    logSpy.mockRestore();
  });
});
