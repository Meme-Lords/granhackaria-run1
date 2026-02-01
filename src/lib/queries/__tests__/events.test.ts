import { describe, it, expect, vi, beforeEach } from "vitest";

type QueryResult = { data: unknown; error: { message: string } | null };

const { queryResult, mockClient } = vi.hoisted(() => {
  const queryResult: QueryResult = { data: [], error: null };
  const terminalOrder = vi.fn().mockImplementation(() => Promise.resolve(queryResult));
  const eqOrderChain = { order: terminalOrder };
  const eqChain = { eq: vi.fn().mockReturnValue(eqOrderChain) };
  const weekSecondOrder = { order: terminalOrder };
  const weekFirstOrder = { order: vi.fn().mockReturnValue(weekSecondOrder) };
  const lteChain = { lte: vi.fn().mockReturnValue(weekFirstOrder) };
  const gtChain = { gt: vi.fn().mockReturnValue(lteChain) };
  const selectChain = {
    select: vi.fn().mockReturnValue({
      eq: eqChain.eq,
      gt: gtChain.gt,
    }),
  };
  const mockClient = { from: vi.fn().mockReturnValue(selectChain) };
  return { queryResult, mockClient };
});

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServer: vi.fn().mockResolvedValue(mockClient),
}));

beforeEach(() => {
  queryResult.data = [];
  queryResult.error = null;
  vi.clearAllMocks();
});

import {
  getTodayEvents,
  getTomorrowEvents,
  getThisWeekEvents,
} from "../events";

describe("getTodayEvents", () => {
  it("returns EventCardProps for today when query succeeds", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "1",
        title: "Jazz Night",
        description: "Live jazz",
        date_start: today,
        date_end: null,
        time: "20:00",
        location: "Vegueta",
        category: "music",
        ticket_price: "10€",
        image_url: "https://example.com/1.jpg",
        source: "instagram",
        source_url: "https://instagram.com/p/1",
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Jazz Night",
      location: "Vegueta",
      time: "20:00",
      category: "music",
      showClock: true,
      sourceUrl: "https://instagram.com/p/1",
    });
    expect(result[0].imageUrl).toBe("https://example.com/1.jpg");
  });

  it("uses default image when image_url is null", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "2",
        title: "No Image Event",
        description: null,
        date_start: today,
        date_end: null,
        time: null,
        location: "Las Palmas",
        category: "festival",
        ticket_price: null,
        image_url: null,
        source: "slack",
        source_url: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents();

    expect(result[0].imageUrl).toContain("unsplash.com");
    expect(result[0].time).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/);
  });

  it("returns empty array when query errors", async () => {
    queryResult.data = null;
    queryResult.error = { message: "Connection failed" };

    const result = await getTodayEvents();

    expect(result).toEqual([]);
  });
});

describe("getTomorrowEvents", () => {
  it("returns EventCardProps for tomorrow when query succeeds", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    queryResult.data = [
      {
        id: "3",
        title: "Tomorrow Show",
        description: null,
        date_start: tomorrowStr,
        date_end: null,
        time: "19:00",
        location: "Auditorio",
        category: "theater",
        ticket_price: null,
        image_url: null,
        source: "instagram",
        source_url: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTomorrowEvents();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Tomorrow Show",
      location: "Auditorio",
      showClock: false,
    });
  });

  it("returns empty array when query errors", async () => {
    queryResult.data = null;
    queryResult.error = { message: "DB error" };

    const result = await getTomorrowEvents();

    expect(result).toEqual([]);
  });
});

describe("getThisWeekEvents", () => {
  it("returns EventCardProps for this week when query succeeds", async () => {
    queryResult.data = [
      {
        id: "4",
        title: "Week Event",
        description: "Later this week",
        date_start: "2026-02-05",
        date_end: null,
        time: "18:00",
        location: "Casa de Colón",
        category: "arts",
        ticket_price: "Free",
        image_url: null,
        source: "instagram",
        source_url: "https://instagram.com/p/4",
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getThisWeekEvents();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Week Event",
      location: "Casa de Colón",
      category: "arts",
    });
  });

  it("returns empty array when query errors", async () => {
    queryResult.data = null;
    queryResult.error = { message: "Timeout" };

    const result = await getThisWeekEvents();

    expect(result).toEqual([]);
  });
});
