import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/meetup/auth", () => ({
  getAccessToken: vi.fn().mockResolvedValue("mock_token"),
  clearAccessTokenCache: vi.fn(),
}));

import * as meetupAuth from "@/lib/meetup/auth";
import { transformMeetupEvent, fetchMeetupEvents, type RawMeetupEvent } from "../meetup";

const mockGetAccessToken = vi.mocked(meetupAuth.getAccessToken);

beforeEach(() => {
  vi.clearAllMocks();
  mockGetAccessToken.mockResolvedValue("mock_token");
  vi.stubGlobal("fetch", vi.fn());
});

describe("transformMeetupEvent", () => {
  it("transforms full event to RawEvent", () => {
    const node: RawMeetupEvent = {
      id: "evt1",
      title: "Salsa Night",
      description: "Dance the night away.",
      dateTime: "2026-02-15T20:00:00+00:00",
      duration: 180,
      eventUrl: "https://www.meetup.com/group/events/123/",
      featuredEventPhoto: { baseUrl: "https://img.meetup.com/photo.jpg" },
      venue: { name: "Bar La Palma", address: "Calle Mayor 1", city: "Las Palmas" },
      group: { name: "Salsa Canaria" },
    };

    const event = transformMeetupEvent(node);

    expect(event.title).toBe("Salsa Night");
    expect(event.title_en).toBe("Salsa Night");
    expect(event.title_es).toBe("Salsa Night");
    expect(event.description).toBe("Dance the night away.");
    expect(event.date_start).toBe("2026-02-15");
    expect(event.time).toBeTruthy();
    expect(event.location).toContain("Bar La Palma");
    expect(event.location).toContain("Las Palmas");
    expect(event.category).toBe("music");
    expect(event.image_url).toBe("https://img.meetup.com/photo.jpg");
    expect(event.source).toBe("meetup");
    expect(event.source_url).toBe("https://www.meetup.com/group/events/123/");
    expect(event.ticket_price).toBeNull();
  });

  it("maps category by keyword (workshop)", () => {
    const node: RawMeetupEvent = {
      id: "e1",
      title: "Business Course & Seminar",
      description: "Training and learning session.",
      dateTime: "2026-03-01T18:00:00Z",
      eventUrl: "https://meetup.com/e/1",
      venue: { name: "Coworking" },
      group: { name: "Learning Club" },
    };

    const event = transformMeetupEvent(node);

    expect(event.category).toBe("workshop");
  });

  it("maps category by keyword (sports)", () => {
    const node: RawMeetupEvent = {
      id: "e2",
      title: "Sunset Yoga Session",
      description: "Yoga on the beach.",
      dateTime: "2026-02-20T19:00:00Z",
      eventUrl: "https://meetup.com/e/2",
      venue: null,
      group: { name: "Yoga GC" },
    };

    const event = transformMeetupEvent(node);

    expect(event.category).toBe("sports");
    expect(event.location).toBe("Online");
  });

  it("handles missing venue (Online)", () => {
    const node: RawMeetupEvent = {
      id: "e3",
      title: "Online Meetup",
      description: null,
      dateTime: "2026-02-10T12:00:00Z",
      eventUrl: "https://meetup.com/e/3",
      venue: null,
      group: null,
    };

    const event = transformMeetupEvent(node);

    expect(event.location).toBe("Online");
    expect(event.description).toBeNull();
    expect(event.image_url).toBeNull();
  });

  it("handles missing dateTime", () => {
    const node: RawMeetupEvent = {
      id: "e4",
      title: "TBD Event",
      description: null,
      dateTime: null,
      eventUrl: "https://meetup.com/e/4",
      venue: null,
      group: null,
    };

    const event = transformMeetupEvent(node);

    expect(event.date_start).toBe("");
    expect(event.time).toBeNull();
  });
});

describe("fetchMeetupEvents", () => {
  it("returns events from GraphQL response", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          eventsSearch: {
            edges: [
              {
                node: {
                  id: "1",
                  title: "Test Event",
                  description: "Desc",
                  dateTime: "2026-02-15T19:00:00Z",
                  eventUrl: "https://meetup.com/e/1",
                  venue: { name: "Venue A" },
                  group: { name: "Group A" },
                },
              },
            ],
          },
        },
      }),
    } as Response);

    const events = await fetchMeetupEvents({ first: 10 });

    expect(events).toHaveLength(1);
    expect(events[0].title).toBe("Test Event");
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.meetup.com/gql",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer mock_token",
          "Content-Type": "application/json",
        }),
      })
    );
    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.variables.lat).toBe(27.9202);
    expect(body.variables.lon).toBe(-15.5474);
    expect(body.variables.radius).toBe(50);
    expect(body.variables.first).toBe(10);
  });

  it("uses default options when not passed", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: { eventsSearch: { edges: [] } } }),
    } as Response);

    await fetchMeetupEvents();

    const body = JSON.parse(mockFetch.mock.calls[0][1].body as string);
    expect(body.variables.first).toBe(50);
    expect(body.variables.radius).toBe(50);
  });

  it("throws on 401 and clears token cache", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401 } as Response);

    await expect(fetchMeetupEvents()).rejects.toThrow("Meetup API unauthorized");

    expect(vi.mocked(meetupAuth.clearAccessTokenCache)).toHaveBeenCalled();
  });

  it("throws on GraphQL errors", async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ errors: [{ message: "Invalid query" }] }),
    } as Response);

    await expect(fetchMeetupEvents()).rejects.toThrow("Meetup GraphQL errors");
  });
});
