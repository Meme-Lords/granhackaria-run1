import { describe, it, expect, vi, beforeEach } from "vitest";

type QueryResult = { data: unknown; error: { message: string } | null };

const SOURCE_URL_GONE_FILTER = "source_url_gone.is.null,source_url_gone.eq.false";

const { queryResult, mockClient, orMock } = vi.hoisted(() => {
  const queryResult: QueryResult = { data: [], error: null };
  const terminalOrder = vi.fn().mockImplementation(() => Promise.resolve(queryResult));
  const eqOrderChain = { order: terminalOrder };
  const orChain = { order: terminalOrder };
  const orMock = vi.fn().mockReturnValue(orChain);
  const eqThenOr = { or: orMock };
  const eqChain = { eq: vi.fn().mockReturnValue(eqThenOr) };
  const weekFirstOrder = { order: terminalOrder };
  const weekOrChain = { order: vi.fn().mockReturnValue(weekFirstOrder) };
  const lteChain = { lte: vi.fn().mockReturnValue({ or: vi.fn().mockReturnValue(weekOrChain) }) };
  const gtChain = { gt: vi.fn().mockReturnValue(lteChain) };
  const selectChain = {
    select: vi.fn().mockReturnValue({
      eq: eqChain.eq,
      gt: gtChain.gt,
    }),
  };
  const mockClient = { from: vi.fn().mockReturnValue(selectChain) };
  return { queryResult, mockClient, orMock };
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
  it("returns EventCardProps for today when query succeeds (EN)", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "1",
        title: "Jazz Night",
        title_en: "Jazz Night",
        title_es: "Noche de Jazz",
        description: "Live jazz",
        description_en: "Live jazz",
        description_es: "Jazz en vivo",
        source_language: "en",
        date_start: today,
        date_end: null,
        time: "20:00",
        location: "Vegueta",
        category: "music",
        ticket_price: "10€",
        image_url: "https://example.com/1.jpg",
        source: "instagram",
        source_url: "https://instagram.com/p/1",
        source_url_gone: false,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents("en");

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      title: "Jazz Night",
      description: "Live jazz",
      location: "Vegueta",
      category: "music",
      showClock: true,
      sourceUrl: "https://instagram.com/p/1",
    });
    expect(result[0].time).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/);
    expect(result[0].time).toContain("20:00");
    expect(result[0].imageUrl).toBe("https://example.com/1.jpg");
  });

  it("returns Spanish title/description when locale is es", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "1",
        title: "Jazz Night",
        title_en: "Jazz Night",
        title_es: "Noche de Jazz",
        description: "Live jazz",
        description_en: "Live jazz",
        description_es: "Jazz en vivo",
        source_language: "en",
        date_start: today,
        date_end: null,
        time: "20:00",
        location: "Vegueta",
        category: "music",
        ticket_price: "10€",
        image_url: "https://example.com/1.jpg",
        source: "instagram",
        source_url: "https://instagram.com/p/1",
        source_url_gone: false,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents("es");

    expect(result[0].title).toBe("Noche de Jazz");
    expect(result[0].description).toBe("Jazz en vivo");
  });

  it("falls back to title when bilingual columns are null", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "1",
        title: "Legacy Event",
        title_en: null,
        title_es: null,
        description: "Old description",
        description_en: null,
        description_es: null,
        source_language: null,
        date_start: today,
        date_end: null,
        time: "20:00",
        location: "Vegueta",
        category: "music",
        ticket_price: null,
        image_url: null,
        source: "instagram",
        source_url: null,
        source_url_gone: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents("en");

    expect(result[0].title).toBe("Legacy Event");
    expect(result[0].description).toBe("Old description");
  });

  it("uses default image when image_url is null", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "2",
        title: "No Image Event",
        title_en: "No Image Event",
        title_es: "Evento Sin Imagen",
        description: null,
        description_en: null,
        description_es: null,
        source_language: "en",
        date_start: today,
        date_end: null,
        time: null,
        location: "Las Palmas",
        category: "festival",
        ticket_price: null,
        image_url: null,
        source: "slack",
        source_url: null,
        source_url_gone: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents("en");

    expect(result[0].imageUrl).toContain("unsplash.com");
    expect(result[0].time).toMatch(/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/);
  });

  it("formats date in Spanish when locale is es", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "2",
        title: "Evento",
        title_en: "Event",
        title_es: "Evento",
        description: null,
        description_en: null,
        description_es: null,
        source_language: "es",
        date_start: today,
        date_end: null,
        time: null,
        location: "Las Palmas",
        category: "festival",
        ticket_price: null,
        image_url: null,
        source: "slack",
        source_url: null,
        source_url_gone: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTodayEvents("es");

    // Spanish date should contain Spanish weekday abbreviations
    expect(result[0].time).toMatch(/^(lun|mar|mié|jue|vie|sáb|dom)/);
  });

  it("excludes events with source_url_gone (query uses source_url_gone filter)", async () => {
    const today = new Date().toISOString().split("T")[0];
    queryResult.data = [
      {
        id: "1",
        title: "Live",
        title_en: "Live",
        title_es: "En vivo",
        description: null,
        description_en: null,
        description_es: null,
        source_language: "en",
        date_start: today,
        date_end: null,
        time: "20:00",
        location: "Vegueta",
        category: "music",
        ticket_price: null,
        image_url: null,
        source: "instagram",
        source_url: "https://instagram.com/p/1",
        source_url_gone: false,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    await getTodayEvents("en");

    expect(orMock).toHaveBeenCalledWith(SOURCE_URL_GONE_FILTER);
  });

  it("returns empty array when query errors", async () => {
    queryResult.data = null;
    queryResult.error = { message: "Connection failed" };

    const result = await getTodayEvents("en");

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
        title_en: "Tomorrow Show",
        title_es: "Espectáculo de Mañana",
        description: null,
        description_en: null,
        description_es: null,
        source_language: "en",
        date_start: tomorrowStr,
        date_end: null,
        time: "19:00",
        location: "Auditorio",
        category: "theater",
        ticket_price: null,
        image_url: null,
        source: "instagram",
        source_url: null,
        source_url_gone: null,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getTomorrowEvents("en");

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

    const result = await getTomorrowEvents("en");

    expect(result).toEqual([]);
  });
});

describe("getThisWeekEvents", () => {
  it("returns EventCardProps for this week when query succeeds", async () => {
    queryResult.data = [
      {
        id: "4",
        title: "Week Event",
        title_en: "Week Event",
        title_es: "Evento de la Semana",
        description: "Later this week",
        description_en: "Later this week",
        description_es: "Más adelante esta semana",
        source_language: "en",
        date_start: "2026-02-05",
        date_end: null,
        time: "18:00",
        location: "Casa de Colón",
        category: "arts",
        ticket_price: "Free",
        image_url: null,
        source: "instagram",
        source_url: "https://instagram.com/p/4",
        source_url_gone: false,
        created_at: "2026-02-01T00:00:00Z",
      },
    ];
    queryResult.error = null;

    const result = await getThisWeekEvents("en");

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

    const result = await getThisWeekEvents("en");

    expect(result).toEqual([]);
  });
});
