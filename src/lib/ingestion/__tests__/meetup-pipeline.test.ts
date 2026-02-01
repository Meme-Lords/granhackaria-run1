import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock("../meetup", () => ({
  fetchMeetupEvents: vi.fn(),
  transformMeetupEvent: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

import { ingestFromMeetup } from "../meetup-pipeline";
import { fetchMeetupEvents, transformMeetupEvent } from "../meetup";

const mockFetchMeetupEvents = vi.mocked(fetchMeetupEvents);
const mockTransformMeetupEvent = vi.mocked(transformMeetupEvent);

const sampleRawNode = {
  id: "evt1",
  title: "Salsa Night",
  description: "Dance.",
  dateTime: "2026-02-15T20:00:00Z",
  eventUrl: "https://www.meetup.com/e/1/",
  venue: { name: "Bar" },
  group: { name: "Salsa" },
};

const sampleEvent = {
  title: "Salsa Night",
  title_en: "Salsa Night",
  title_es: "Salsa Night",
  description: "Dance.",
  description_en: "Dance.",
  description_es: "Dance.",
  source_language: "unknown" as const,
  date_start: "2026-02-15",
  time: "20:00",
  location: "Bar",
  ticket_price: null,
  category: "music" as const,
  image_url: null,
  source: "meetup" as const,
  source_url: "https://www.meetup.com/e/1/",
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
  vi.stubEnv("MEETUP_CLIENT_ID", "cid");
  vi.stubEnv("MEETUP_REFRESH_TOKEN", "rt");
});

describe("ingestFromMeetup", () => {
  it("fetches, transforms, and upserts events", async () => {
    mockFetchMeetupEvents.mockResolvedValueOnce([sampleRawNode as never]);
    mockTransformMeetupEvent.mockReturnValue(sampleEvent);
    mockUpsert.mockResolvedValue({ error: null });

    const result = await ingestFromMeetup();

    expect(mockFetchMeetupEvents).toHaveBeenCalledTimes(1);
    expect(mockTransformMeetupEvent).toHaveBeenCalledWith(sampleRawNode);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(result.inserted).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it("skips events with no date_start", async () => {
    mockFetchMeetupEvents.mockResolvedValueOnce([sampleRawNode as never]);
    mockTransformMeetupEvent.mockReturnValue({
      ...sampleEvent,
      date_start: "",
    });

    const result = await ingestFromMeetup();

    expect(mockUpsert).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("skips events with no source_url", async () => {
    mockFetchMeetupEvents.mockResolvedValueOnce([sampleRawNode as never]);
    mockTransformMeetupEvent.mockReturnValue({
      ...sampleEvent,
      source_url: null,
    });

    const result = await ingestFromMeetup();

    expect(mockUpsert).not.toHaveBeenCalled();
    expect(result.skipped).toBe(1);
  });

  it("counts database errors", async () => {
    mockFetchMeetupEvents.mockResolvedValueOnce([sampleRawNode as never]);
    mockTransformMeetupEvent.mockReturnValue(sampleEvent);
    mockUpsert.mockResolvedValueOnce({ error: { message: "constraint violation" } });

    const result = await ingestFromMeetup();

    expect(result.errors).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("throws when Meetup credentials not set", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");

    await expect(ingestFromMeetup()).rejects.toThrow("Meetup credentials not configured");
    expect(mockFetchMeetupEvents).not.toHaveBeenCalled();
  });

  it("handles empty event list", async () => {
    mockFetchMeetupEvents.mockResolvedValueOnce([]);

    const result = await ingestFromMeetup();

    expect(result.inserted).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(mockTransformMeetupEvent).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();
  });

  it("throws when Supabase env missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");

    await expect(ingestFromMeetup()).rejects.toThrow(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY"
    );
    expect(mockFetchMeetupEvents).not.toHaveBeenCalled();
  });
});
