import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  exchangeCodeForTokens,
  refreshAccessToken,
  getAccessToken,
  clearAccessTokenCache,
} from "../auth";

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal("fetch", mockFetch);
  vi.clearAllMocks();
  clearAccessTokenCache();
  vi.unstubAllEnvs();
});

describe("exchangeCodeForTokens", () => {
  it("exchanges code for access_token and refresh_token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "at_123",
        refresh_token: "rt_456",
        expires_in: 3600,
        token_type: "bearer",
      }),
    });

    const result = await exchangeCodeForTokens(
      "client_id",
      "client_secret",
      "https://app.example.com/callback",
      "auth_code_xyz"
    );

    expect(result.access_token).toBe("at_123");
    expect(result.refresh_token).toBe("rt_456");
    expect(result.expires_in).toBe(3600);
    expect(mockFetch).toHaveBeenCalledWith(
      "https://secure.meetup.com/oauth2/access",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      })
    );
  });

  it("throws on non-ok response", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => "invalid_grant" });

    await expect(
      exchangeCodeForTokens("c", "s", "https://cb", "bad_code")
    ).rejects.toThrow("Meetup token exchange failed (400)");
  });
});

describe("refreshAccessToken", () => {
  it("refreshes and returns new access_token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        access_token: "new_at",
        expires_in: 3600,
        token_type: "bearer",
      }),
    });

    const result = await refreshAccessToken("cid", "csec", "refresh_tok");

    expect(result.access_token).toBe("new_at");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const body = mockFetch.mock.calls[0][1].body;
    expect(body).toContain("grant_type=refresh_token");
    expect(body).toContain("refresh_token=refresh_tok");
  });

  it("throws on 401", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, text: async () => "Unauthorized" });

    await expect(refreshAccessToken("c", "s", "bad_refresh")).rejects.toThrow(
      "Meetup token refresh failed (401)"
    );
  });
});

describe("getAccessToken", () => {
  it("returns cached token when available", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "cid");
    vi.stubEnv("MEETUP_CLIENT_SECRET", "csec");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "rt");

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "first",
        expires_in: 3600,
        token_type: "bearer",
      }),
    });

    const first = await getAccessToken();
    const second = await getAccessToken();

    expect(first).toBe("first");
    expect(second).toBe("first");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("refreshes when no cache and env set", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "cid");
    vi.stubEnv("MEETUP_CLIENT_SECRET", "csec");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "rt");

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "from_refresh",
        expires_in: 3600,
        token_type: "bearer",
      }),
    });

    const token = await getAccessToken();

    expect(token).toBe("from_refresh");
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it("throws when env vars missing", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");

    await expect(getAccessToken()).rejects.toThrow("Meetup credentials not configured");
    expect(mockFetch).not.toHaveBeenCalled();
  });
});

describe("clearAccessTokenCache", () => {
  it("forces refresh on next getAccessToken", async () => {
    vi.stubEnv("MEETUP_CLIENT_ID", "cid");
    vi.stubEnv("MEETUP_CLIENT_SECRET", "csec");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "rt");

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "first", expires_in: 3600, token_type: "bearer" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "second", expires_in: 3600, token_type: "bearer" }),
      });

    const a = await getAccessToken();
    clearAccessTokenCache();
    const b = await getAccessToken();

    expect(a).toBe("first");
    expect(b).toBe("second");
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });
});
