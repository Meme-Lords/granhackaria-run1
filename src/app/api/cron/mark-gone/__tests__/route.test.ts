import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/mark-gone-source-urls", () => ({
  markGoneSourceUrls: vi.fn(),
}));

import { GET } from "../route";
import { markGoneSourceUrls } from "@/lib/mark-gone-source-urls";

const mockMarkGoneSourceUrls = vi.mocked(markGoneSourceUrls);

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/cron/mark-gone", {
    method: "GET",
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("GET /api/cron/mark-gone", () => {
  it("returns 401 when CRON_SECRET is set and authorization header is missing", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
    expect(mockMarkGoneSourceUrls).not.toHaveBeenCalled();
  });

  it("returns 401 when CRON_SECRET is set and authorization header is wrong", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");

    const response = await GET(makeRequest({ authorization: "Bearer wrong" }));

    expect(response.status).toBe(401);
    expect(mockMarkGoneSourceUrls).not.toHaveBeenCalled();
  });

  it("returns 200 with result when authorized", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");
    mockMarkGoneSourceUrls.mockResolvedValue({
      checked: 30,
      marked: 2,
      errors: 0,
    });

    const response = await GET(makeRequest({ authorization: "Bearer my-secret" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checked).toBe(30);
    expect(body.marked).toBe(2);
    expect(body.errors).toBe(0);
    expect(body.timestamp.start).toBeDefined();
    expect(body.timestamp.end).toBeDefined();
    expect(mockMarkGoneSourceUrls).toHaveBeenCalledTimes(1);
  });

  it("returns 500 when markGoneSourceUrls throws", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");
    mockMarkGoneSourceUrls.mockRejectedValue(new Error("DB error"));

    const response = await GET(makeRequest({ authorization: "Bearer my-secret" }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("DB error");
    expect(body.timestamp.start).toBeDefined();
    expect(body.timestamp.end).toBeDefined();
  });

  it("allows access when CRON_SECRET is not set", async () => {
    mockMarkGoneSourceUrls.mockResolvedValue({
      checked: 0,
      marked: 0,
      errors: 0,
    });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.checked).toBe(0);
    expect(mockMarkGoneSourceUrls).toHaveBeenCalledTimes(1);
  });
});
