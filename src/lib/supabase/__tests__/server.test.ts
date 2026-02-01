import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreateServerClient = vi.fn();
const mockCookies = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}));

vi.mock("next/headers", () => ({
  cookies: () => mockCookies(),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");

  const fakeCookieStore = {
    getAll: vi.fn().mockReturnValue([]),
    set: vi.fn(),
  };
  mockCookies.mockResolvedValue(fakeCookieStore);

  const fakeClient = { from: vi.fn() };
  mockCreateServerClient.mockReturnValue(fakeClient);
});

import { createSupabaseServer } from "../server";

describe("createSupabaseServer", () => {
  it("returns a Supabase client from createServerClient", async () => {
    const client = await createSupabaseServer();

    expect(client).toBeDefined();
    expect(mockCreateServerClient).toHaveBeenCalledTimes(1);
  });

  it("calls createServerClient with env URL and anon key", async () => {
    await createSupabaseServer();

    expect(mockCreateServerClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "test-anon-key",
      expect.objectContaining({
        cookies: expect.objectContaining({
          getAll: expect.any(Function),
          setAll: expect.any(Function),
        }),
      })
    );
  });

  it("uses cookie store from next/headers cookies()", async () => {
    await createSupabaseServer();

    expect(mockCookies).toHaveBeenCalled();
  });

  it("cookie getAll delegates to cookieStore.getAll", async () => {
    const getAll = vi.fn().mockReturnValue([{ name: "sb-token", value: "x" }]);
    mockCookies.mockResolvedValue({ getAll, set: vi.fn() });

    await createSupabaseServer();

    const options = mockCreateServerClient.mock.calls[0][2];
    const result = options.cookies.getAll();
    expect(result).toEqual([{ name: "sb-token", value: "x" }]);
    expect(getAll).toHaveBeenCalled();
  });

  it("cookie setAll delegates to cookieStore.set and catches errors", async () => {
    const set = vi.fn().mockImplementation(() => {
      throw new Error("Server Component");
    });
    mockCookies.mockResolvedValue({ getAll: vi.fn().mockReturnValue([]), set });

    await createSupabaseServer();

    const options = mockCreateServerClient.mock.calls[0][2];
    expect(() =>
      options.cookies.setAll([{ name: "a", value: "b", options: {} }])
    ).not.toThrow();
    expect(set).toHaveBeenCalled();
  });
});
