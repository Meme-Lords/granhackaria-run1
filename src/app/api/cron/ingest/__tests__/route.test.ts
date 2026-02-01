import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/ingestion/instagram-pipeline", () => ({
  ingestFromInstagram: vi.fn(),
}));

vi.mock("@/lib/ingestion/slack-pipeline", () => ({
  ingestFromSlack: vi.fn(),
}));

import { GET } from "../route";
import { ingestFromInstagram } from "@/lib/ingestion/instagram-pipeline";
import { ingestFromSlack } from "@/lib/ingestion/slack-pipeline";

const mockIngestFromInstagram = vi.mocked(ingestFromInstagram);
const mockIngestFromSlack = vi.mocked(ingestFromSlack);

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/cron/ingest", {
    method: "GET",
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
});

describe("GET /api/cron/ingest", () => {
  it("returns 401 when CRON_SECRET is set and authorization header is missing", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  it("returns 401 when CRON_SECRET is set and authorization header is wrong", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");

    const response = await GET(makeRequest({ authorization: "Bearer wrong" }));

    expect(response.status).toBe(401);
  });

  it("runs both pipelines when authorized", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");
    vi.stubEnv("INSTAGRAM_ACCOUNTS", "account1,account2");

    mockIngestFromInstagram.mockResolvedValue({ inserted: 3, skipped: 1, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 2, skipped: 0, errors: 0 });

    const response = await GET(makeRequest({ authorization: "Bearer my-secret" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ inserted: 3, skipped: 1, errors: 0 });
    expect(body.slack).toEqual({ inserted: 2, skipped: 0, errors: 0 });
    expect(body.timestamp.start).toBeDefined();
    expect(body.timestamp.end).toBeDefined();
    expect(mockIngestFromInstagram).toHaveBeenCalledWith(["account1", "account2"]);
    expect(mockIngestFromSlack).toHaveBeenCalledTimes(1);
  });

  it("allows access when CRON_SECRET is not set", async () => {
    vi.stubEnv("INSTAGRAM_ACCOUNTS", "account1");

    mockIngestFromInstagram.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 0, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());

    expect(response.status).toBe(200);
  });

  it("handles Instagram failure without blocking Slack", async () => {
    vi.stubEnv("INSTAGRAM_ACCOUNTS", "account1");

    mockIngestFromInstagram.mockRejectedValue(new Error("Instagram API down"));
    mockIngestFromSlack.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ error: "Instagram API down" });
    expect(body.slack).toEqual({ inserted: 1, skipped: 0, errors: 0 });
  });

  it("handles Slack failure without blocking Instagram", async () => {
    vi.stubEnv("INSTAGRAM_ACCOUNTS", "account1");

    mockIngestFromInstagram.mockResolvedValue({ inserted: 2, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockRejectedValue(new Error("Slack API down"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ inserted: 2, skipped: 0, errors: 0 });
    expect(body.slack).toEqual({ error: "Slack API down" });
  });

  it("reports missing INSTAGRAM_ACCOUNTS config", async () => {
    vi.stubEnv("INSTAGRAM_ACCOUNTS", "");
    mockIngestFromSlack.mockResolvedValue({ inserted: 0, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({
      error:
        "Instagram accounts not configured (Statsig instagram_accounts or INSTAGRAM_ACCOUNTS)",
    });
    expect(body.slack).toEqual({ inserted: 0, skipped: 0, errors: 0 });
  });
});
