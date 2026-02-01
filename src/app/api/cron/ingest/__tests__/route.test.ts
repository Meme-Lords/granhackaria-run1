import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/ingestion/instagram-pipeline", () => ({
  ingestFromInstagram: vi.fn(),
}));

vi.mock("@/lib/ingestion/slack-pipeline", () => ({
  ingestFromSlack: vi.fn(),
}));

vi.mock("@/lib/ingestion/meetup-pipeline", () => ({
  ingestFromMeetup: vi.fn(),
}));

vi.mock("@/lib/statsig/server", () => ({
  getInstagramAccountsFromStatsig: vi.fn(),
  getPostsDaysBackFromStatsig: vi.fn().mockResolvedValue(14),
}));

import { GET } from "../route";
import { getInstagramAccountsFromStatsig } from "@/lib/statsig/server";
import { ingestFromInstagram } from "@/lib/ingestion/instagram-pipeline";
import { ingestFromSlack } from "@/lib/ingestion/slack-pipeline";
import { ingestFromMeetup } from "@/lib/ingestion/meetup-pipeline";

const mockIngestFromInstagram = vi.mocked(ingestFromInstagram);
const mockIngestFromSlack = vi.mocked(ingestFromSlack);
const mockIngestFromMeetup = vi.mocked(ingestFromMeetup);
const mockGetInstagramAccountsFromStatsig = vi.mocked(getInstagramAccountsFromStatsig);

function makeRequest(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost:3000/api/cron/ingest", {
    method: "GET",
    headers,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.unstubAllEnvs();
  mockGetInstagramAccountsFromStatsig.mockResolvedValue([]);
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

  it("runs all three pipelines when authorized and Meetup creds set", async () => {
    vi.stubEnv("CRON_SECRET", "my-secret");
    vi.stubEnv("MEETUP_CLIENT_ID", "mid");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "mrt");
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["account1", "account2"]);

    mockIngestFromInstagram.mockResolvedValue({ inserted: 3, skipped: 1, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 2, skipped: 0, errors: 0 });
    mockIngestFromMeetup.mockResolvedValue({ inserted: 5, skipped: 0, errors: 0 });

    const response = await GET(makeRequest({ authorization: "Bearer my-secret" }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ inserted: 3, skipped: 1, errors: 0 });
    expect(body.slack).toEqual({ inserted: 2, skipped: 0, errors: 0 });
    expect(body.meetup).toEqual({ inserted: 5, skipped: 0, errors: 0 });
    expect(body.timestamp.start).toBeDefined();
    expect(body.timestamp.end).toBeDefined();
    expect(mockIngestFromInstagram).toHaveBeenCalledWith(["account1", "account2"]);
    expect(mockIngestFromSlack).toHaveBeenCalledTimes(1);
    expect(mockIngestFromMeetup).toHaveBeenCalledTimes(1);
  });

  it("allows access when CRON_SECRET is not set", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["account1"]);

    mockIngestFromInstagram.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 0, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meetup).toBeDefined();
  });

  it("handles Instagram failure without blocking Slack", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["account1"]);

    mockIngestFromInstagram.mockRejectedValue(new Error("Instagram API down"));
    mockIngestFromSlack.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ error: "Instagram API down" });
    expect(body.slack).toEqual({ inserted: 1, skipped: 0, errors: 0 });
  });

  it("handles Slack failure without blocking Instagram", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["account1"]);

    mockIngestFromInstagram.mockResolvedValue({ inserted: 2, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockRejectedValue(new Error("Slack API down"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ inserted: 2, skipped: 0, errors: 0 });
    expect(body.slack).toEqual({ error: "Slack API down" });
  });

  it("reports missing INSTAGRAM_ACCOUNTS config", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue([]);
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

  it("skips Meetup when credentials not configured", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["a1"]);
    vi.stubEnv("MEETUP_CLIENT_ID", "");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "");

    mockIngestFromInstagram.mockResolvedValue({ inserted: 0, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 0, skipped: 0, errors: 0 });

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.meetup).toEqual({
      error: "Meetup credentials not configured (MEETUP_CLIENT_ID, MEETUP_REFRESH_TOKEN)",
    });
    expect(mockIngestFromMeetup).not.toHaveBeenCalled();
  });

  it("handles Meetup failure without blocking others", async () => {
    mockGetInstagramAccountsFromStatsig.mockResolvedValue(["a1"]);
    vi.stubEnv("MEETUP_CLIENT_ID", "mid");
    vi.stubEnv("MEETUP_REFRESH_TOKEN", "mrt");

    mockIngestFromInstagram.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });
    mockIngestFromSlack.mockResolvedValue({ inserted: 1, skipped: 0, errors: 0 });
    mockIngestFromMeetup.mockRejectedValue(new Error("Meetup API down"));

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.instagram).toEqual({ inserted: 1, skipped: 0, errors: 0 });
    expect(body.slack).toEqual({ inserted: 1, skipped: 0, errors: 0 });
    expect(body.meetup).toEqual({ error: "Meetup API down" });
  });
});
