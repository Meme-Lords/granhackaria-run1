import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockInsert = vi.fn();
const mockConfig = vi.fn();

vi.mock("dotenv", () => ({
  config: (opts: { path: string }) => mockConfig(opts),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: mockInsert,
    }),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://seed-test.supabase.co");
  vi.stubEnv("SUPABASE_SECRET_KEY", "seed-service-key");
  mockInsert.mockReturnValue({
    select: vi.fn().mockResolvedValue({ data: [1, 2, 3], error: null }),
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("seed script", () => {
  it("loads .env and .env.local and creates client with env vars", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);

    await import("../seed");
    await new Promise((r) => setImmediate(r)); // let async seed() finish

    expect(mockConfig).toHaveBeenCalledWith({ path: ".env" });
    expect(mockConfig).toHaveBeenCalledWith({ path: ".env.local" });
    const { createClient } = await import("@supabase/supabase-js");
    expect(createClient).toHaveBeenCalledWith(
      "https://seed-test.supabase.co",
      "seed-service-key"
    );
    expect(mockInsert).toHaveBeenCalled();
    const inserted = mockInsert.mock.calls[0][0];
    expect(Array.isArray(inserted)).toBe(true);
    expect(inserted.length).toBeGreaterThan(0);
    expect(inserted[0]).toMatchObject({
      title: expect.any(String),
      date_start: expect.any(String),
      location: expect.any(String),
      category: expect.any(String),
      source: "manual",
      source_url: expect.stringContaining("seed://"),
    });

    exitSpy.mockRestore();
  });

  it("inserts events with expected shape (today, tomorrow, this week)", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);

    vi.resetModules();
    await import("../seed");
    await new Promise((r) => setImmediate(r)); // let async seed() finish

    const events = mockInsert.mock.calls[0][0];
    const titles = events.map((e: { title: string }) => e.title);
    expect(titles).toContain("Jazz Night at Alfredo Kraus");
    expect(titles).toContain("Tapas Festival at Vegueta");
    expect(titles).toContain("UD Las Palmas vs Real Madrid");
    expect(titles).toContain("Carnival Opening Ceremony");
    expect(titles).toContain("Farmers Market & Crafts");

    const categories = [...new Set(events.map((e: { category: string }) => e.category))];
    expect(categories).toContain("music");
    expect(categories).toContain("arts");
    expect(categories).toContain("food");
    expect(categories).toContain("sports");
    expect(categories).toContain("festival");
    expect(categories).toContain("market");

    exitSpy.mockRestore();
  });

  it("exits with 1 and logs when env vars are missing", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SECRET_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");

    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.resetModules();
    await import("../seed");

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env or .env.local"
    );
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("exits with 0 and logs when events already seeded (23505)", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);
    const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    mockInsert.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: null,
        error: { code: "23505", message: "duplicate key" },
      }),
    });

    vi.resetModules();
    await import("../seed");
    await new Promise((r) => setImmediate(r));

    expect(consoleLogSpy).toHaveBeenCalledWith(
      "Events already seeded (duplicate source_url). Skipping."
    );
    expect(exitSpy).toHaveBeenCalledWith(0);

    exitSpy.mockRestore();
    consoleLogSpy.mockRestore();
  });

  it("exits with 1 and logs when insert fails with other error", async () => {
    const exitSpy = vi.spyOn(process, "exit").mockImplementation((() => {}) as () => never);
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockInsert.mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: null,
        error: { code: "OTHER", message: "connection refused" },
      }),
    });

    vi.resetModules();
    await import("../seed");
    await new Promise((r) => setImmediate(r));

    expect(consoleErrorSpy).toHaveBeenCalledWith("Seed failed:", "connection refused");
    expect(exitSpy).toHaveBeenCalledWith(1);

    exitSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });
});
