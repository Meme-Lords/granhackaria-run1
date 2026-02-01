import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  transformApifyMeetupItem,
  fetchMeetupEventsFromApify,
  type ApifyMeetupItem,
} from "../meetup-apify";

describe("transformApifyMeetupItem", () => {
  it("transforms full item to RawEvent including coverImageUrl", () => {
    const item: ApifyMeetupItem = {
      id: "evt1",
      title: "Salsa Night",
      eventUrl: "https://www.meetup.com/e/1/",
      startsAt: "2026-02-15T20:00:00.000Z",
      description: "Dance the night away.",
      address: "Calle Mayor 1",
      venueName: "Bar La Palma",
      city: "Las Palmas",
      coverImageUrl: "https://example.com/cover.jpg",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.title).toBe("Salsa Night");
    expect(event.title_en).toBe("Salsa Night");
    expect(event.title_es).toBe("Salsa Night");
    expect(event.description).toBe("Dance the night away.");
    expect(event.date_start).toBe("2026-02-15");
    expect(event.time).toBeTruthy();
    expect(event.location).toContain("Bar La Palma");
    expect(event.location).toContain("Las Palmas");
    expect(event.category).toBe("music");
    expect(event.image_url).toBe("https://example.com/cover.jpg");
    expect(event.source).toBe("meetup");
    expect(event.source_url).toBe("https://www.meetup.com/e/1/");
    expect(event.ticket_price).toBeNull();
  });

  it("uses Online when isOnline true", () => {
    const item: ApifyMeetupItem = {
      title: "Online Workshop",
      eventUrl: "https://meetup.com/e/2",
      startsAt: "2026-03-01T18:00:00Z",
      isOnline: true,
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.location).toBe("Online");
    expect(event.category).toBe("workshop");
  });

  it("uses Online when address and venue missing", () => {
    const item: ApifyMeetupItem = {
      title: "Remote Event",
      eventUrl: "https://meetup.com/e/3",
      startsAt: "2026-04-01T10:00:00Z",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.location).toBe("Online");
  });

  it("maps category by keyword from title and description", () => {
    const item: ApifyMeetupItem = {
      title: "Business Course & Seminar",
      description: "Training and learning.",
      eventUrl: "https://meetup.com/e/4",
      startsAt: "2026-04-01T10:00:00Z",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.category).toBe("workshop");
  });

  it("formats ticket_price from priceMin/priceMax and currency", () => {
    const item: ApifyMeetupItem = {
      title: "Paid Concert",
      eventUrl: "https://meetup.com/e/5",
      startsAt: "2026-05-01T19:00:00Z",
      ticketStatus: "paid",
      priceMin: 15,
      priceMax: 15,
      currency: "€",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.ticket_price).toBe("15€");
  });

  it("sets image_url to null when coverImageUrl missing", () => {
    const item: ApifyMeetupItem = {
      title: "No Image Event",
      eventUrl: "https://meetup.com/e/6",
      startsAt: "2026-06-01T12:00:00Z",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.image_url).toBeNull();
  });

  it("uses Untitled Event when title empty", () => {
    const item: ApifyMeetupItem = {
      title: "",
      eventUrl: "https://meetup.com/e/7",
      startsAt: "2026-06-01T12:00:00Z",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.title).toBe("Untitled Event");
  });

  it("handles invalid date gracefully", () => {
    const item: ApifyMeetupItem = {
      title: "Bad Date Event",
      eventUrl: "https://meetup.com/e/8",
      startsAt: "not-a-date",
      platform: "meetup",
    };

    const event = transformApifyMeetupItem(item);

    expect(event.date_start).toBe("");
    expect(event.time).toBeNull();
  });
});

describe("fetchMeetupEventsFromApify", () => {
  const mockFetch = vi.fn();
  beforeEach(() => {
    mockFetch.mockClear();
    vi.stubGlobal("fetch", mockFetch);
    vi.stubEnv("APIFY_API_TOKEN", "test-token");
  });

  it("throws when APIFY_API_TOKEN not set", async () => {
    vi.stubEnv("APIFY_API_TOKEN", "");
    await expect(fetchMeetupEventsFromApify()).rejects.toThrow("APIFY_API_TOKEN is not set");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("calls Event Scraper Pro and returns meetup items only", async () => {
    const items: ApifyMeetupItem[] = [
      {
        id: "e1",
        title: "Event One",
        eventUrl: "https://meetup.com/e/1",
        startsAt: "2026-02-15T20:00:00Z",
        platform: "meetup",
        coverImageUrl: "https://img.example/1.jpg",
      },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(items),
    });

    const result = await fetchMeetupEventsFromApify();

    expect(result).toEqual(items);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain("webdatalabs~event-scraper-pro");
    expect(url).toContain("run-sync-get-dataset-items");
    expect(url).toContain("token=");
    expect(opts?.method).toBe("POST");
    expect(opts?.body).toBeDefined();
    const body = JSON.parse(opts.body as string);
    expect(body.keywords).toEqual(["tech", "meetup", "networking"]);
    expect(Array.isArray(body.cities)).toBe(true);
    expect(body.platforms).toEqual(["meetup"]);
    expect(body.maxItemsPerPlatform).toBeDefined();
    expect(body.dateFrom).toBeDefined();
    expect(body.dateTo).toBeDefined();
  });

  it("uses options when provided", async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) });

    await fetchMeetupEventsFromApify({
      keywords: ["tech"],
      cities: ["Santa Cruz"],
      country: "ES",
      platforms: ["meetup"],
      maxItemsPerPlatform: 20,
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.keywords).toEqual(["tech"]);
    expect(body.cities).toEqual(["Santa Cruz"]);
    expect(body.country).toBe("ES");
    expect(body.platforms).toEqual(["meetup"]);
    expect(body.maxItemsPerPlatform).toBe(20);
  });

  it("filters out non-meetup platform items", async () => {
    const items: ApifyMeetupItem[] = [
      { id: "m1", title: "Meetup Event", eventUrl: "https://meetup.com/e/1", platform: "meetup" },
      { id: "e1", title: "Eventbrite Event", eventUrl: "https://eventbrite.com/e/1", platform: "eventbrite" },
    ];
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(items),
    });

    const result = await fetchMeetupEventsFromApify();

    expect(result).toHaveLength(1);
    expect(result[0].platform).toBe("meetup");
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: () => Promise.resolve("Server error"),
    });

    await expect(fetchMeetupEventsFromApify()).rejects.toThrow("Apify API error (500)");
  });
});
