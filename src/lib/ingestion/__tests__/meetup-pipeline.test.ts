import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock("../meetup", () => ({
  fetchMeetupEvents: vi.fn(),
  transformMeetupEvent: vi.fn(),
}));

vi.mock("../meetup-apify", () => ({
  fetchMeetupEventsFromApify: vi.fn(),
  fetchMeetupEventsFromMeetupScraper: vi.fn(),
  getApifyActor: vi.fn(() => "event-scraper-pro"),
  transformApifyMeetupItem: vi.fn(),
  transformMeetupScraperItem: vi.fn(),
}));

vi.mock("../fetch-event-image", () => ({
  fetchImageUrlFromPage: vi.fn().mockResolvedValue(null),
}));

vi.mock("../translate-event", () => ({
  translateEventToBilingual: vi.fn().mockResolvedValue(null),
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
import { fetchImageUrlFromPage } from "../fetch-event-image";
import {
  fetchMeetupEventsFromApify,
  fetchMeetupEventsFromMeetupScraper,
  getApifyActor,
  transformApifyMeetupItem,
  transformMeetupScraperItem,
} from "../meetup-apify";

const mockFetchMeetupEvents = vi.mocked(fetchMeetupEvents);
const mockTransformMeetupEvent = vi.mocked(transformMeetupEvent);
const mockFetchMeetupEventsFromApify = vi.mocked(fetchMeetupEventsFromApify);
const mockFetchMeetupEventsFromMeetupScraper = vi.mocked(
  fetchMeetupEventsFromMeetupScraper
);
const mockGetApifyActor = vi.mocked(getApifyActor);
const mockTransformApifyMeetupItem = vi.mocked(transformApifyMeetupItem);
const mockTransformMeetupScraperItem = vi.mocked(transformMeetupScraperItem);

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

  it("throws when neither OAuth nor Apify configured", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");
    vi.stubEnv("APIFY_API_TOKEN", "");

    await expect(ingestFromMeetup()).rejects.toThrow(
      "Meetup: set MEETUP_CLIENT_ID and MEETUP_REFRESH_TOKEN (OAuth) or APIFY_API_TOKEN"
    );
    expect(mockFetchMeetupEvents).not.toHaveBeenCalled();
    expect(mockFetchMeetupEventsFromApify).not.toHaveBeenCalled();
  });

  it("uses Apify path when OAuth not set but APIFY_API_TOKEN set", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");
    vi.stubEnv("APIFY_API_TOKEN", "apify-token");

    const sampleApifyItem = {
      id: "e1",
      title: "Apify Event",
      eventUrl: "https://www.meetup.com/e/apify/",
      startsAt: "2026-02-20T19:00:00Z",
      address: "Gran Canaria",
      venueName: "Test Venue",
      city: "Las Palmas",
      platform: "meetup",
    };
    mockFetchMeetupEventsFromApify.mockResolvedValueOnce([sampleApifyItem]);
    mockTransformApifyMeetupItem.mockReturnValueOnce({
      ...sampleEvent,
      title: "Apify Event",
      source_url: "https://www.meetup.com/e/apify/",
    });
    mockUpsert.mockResolvedValue({ error: null });

    const result = await ingestFromMeetup();

    expect(mockFetchMeetupEvents).not.toHaveBeenCalled();
    expect(mockFetchMeetupEventsFromApify).toHaveBeenCalledTimes(1);
    expect(mockTransformApifyMeetupItem).toHaveBeenCalledWith(sampleApifyItem);
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    expect(result.inserted).toBe(1);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it("upserts event with fetched image_url when source has no image", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");
    vi.stubEnv("APIFY_API_TOKEN", "apify-token");
    mockGetApifyActor.mockReturnValue("meetup-scraper");
    const mockFetchImageUrl = vi.mocked(fetchImageUrlFromPage);
    mockFetchImageUrl.mockResolvedValueOnce("https://example.com/og-image.jpg");

    const sampleScraperItem = {
      eventId: "img1",
      eventName: "Event Without Image",
      eventUrl: "https://www.meetup.com/e/no-image/",
      date: "2026-03-01T19:00:00Z",
      address: "Las Palmas",
    };
    mockFetchMeetupEventsFromMeetupScraper.mockResolvedValueOnce([
      sampleScraperItem,
    ]);
    mockTransformMeetupScraperItem.mockReturnValueOnce({
      ...sampleEvent,
      title: "Event Without Image",
      source_url: "https://www.meetup.com/e/no-image/",
      image_url: null,
    });
    mockUpsert.mockResolvedValue({ error: null });

    await ingestFromMeetup();

    expect(mockFetchImageUrl).toHaveBeenCalledWith(
      "https://www.meetup.com/e/no-image/"
    );
    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        image_url: "https://example.com/og-image.jpg",
      }),
      expect.any(Object)
    );
  });

  it("uses meetup-scraper path when MEETUP_APIFY_ACTOR=meetup-scraper", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");
    vi.stubEnv("APIFY_API_TOKEN", "apify-token");
    mockGetApifyActor.mockReturnValue("meetup-scraper");

    const sampleScraperItem = {
      eventId: "ms1",
      eventName: "Meetup Scraper Event",
      eventUrl: "https://www.meetup.com/e/meetup-scraper/",
      date: "2026-02-25T18:00:00Z",
      address: "Las Palmas",
      organizedByGroup: "Tech Group",
    };
    mockFetchMeetupEventsFromMeetupScraper.mockResolvedValueOnce([
      sampleScraperItem,
    ]);
    mockTransformMeetupScraperItem.mockReturnValueOnce({
      ...sampleEvent,
      title: "Meetup Scraper Event",
      source_url: "https://www.meetup.com/e/meetup-scraper/",
    });
    mockUpsert.mockResolvedValue({ error: null });

    const result = await ingestFromMeetup();

    expect(mockFetchMeetupEvents).not.toHaveBeenCalled();
    expect(mockFetchMeetupEventsFromApify).not.toHaveBeenCalled();
    expect(mockFetchMeetupEventsFromMeetupScraper).toHaveBeenCalledTimes(1);
    expect(mockTransformMeetupScraperItem).toHaveBeenCalledWith(
      sampleScraperItem
    );
    expect(result.inserted).toBe(1);
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
