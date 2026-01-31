import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpsert } = vi.hoisted(() => ({
  mockUpsert: vi.fn(),
}));

vi.mock("../slack", () => ({
  fetchChannelMessages: vi.fn(),
}));

vi.mock("../parser", () => ({
  parseEventFromText: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    from: () => ({
      upsert: mockUpsert,
    }),
  }),
}));

import { ingestFromSlack } from "../slack-pipeline";
import { fetchChannelMessages } from "../slack";
import { parseEventFromText } from "../parser";

const mockFetchChannelMessages = vi.mocked(fetchChannelMessages);
const mockParseEventFromText = vi.mocked(parseEventFromText);

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
  vi.stubEnv("SLACK_CHANNEL_ID", "C0123456789");
});

describe("ingestFromSlack", () => {
  it("processes messages from channel", async () => {
    mockFetchChannelMessages.mockResolvedValueOnce([
      {
        ts: "1706745600.000100",
        text: "Concert tonight at Vegueta!",
        user: "U12345",
        permalink: "https://slack.com/archives/C123/p1",
      },
      {
        ts: "1706745700.000200",
        text: "Art show this weekend at CAAM",
        user: "U67890",
        permalink: "https://slack.com/archives/C123/p2",
      },
    ]);

    mockParseEventFromText.mockResolvedValue({
      title: "Test Event",
      description: null,
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      category: "music",
      image_url: null,
      source: "slack",
      source_url: "https://slack.com/archives/C123/p1",
    });

    mockUpsert.mockResolvedValue({ error: null });

    const result = await ingestFromSlack();

    expect(mockFetchChannelMessages).toHaveBeenCalledWith("C0123456789", undefined);
    expect(mockParseEventFromText).toHaveBeenCalledTimes(2);
    expect(mockParseEventFromText).toHaveBeenCalledWith(
      "Concert tonight at Vegueta!",
      "slack",
      "https://slack.com/archives/C123/p1",
      null
    );
    expect(result.inserted).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
  });

  it("skips messages that are not events", async () => {
    mockFetchChannelMessages.mockResolvedValueOnce([
      {
        ts: "1706745600.000100",
        text: "Anyone want to grab coffee?",
        user: "U12345",
        permalink: "https://slack.com/archives/C123/p1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce(null);

    const result = await ingestFromSlack();

    expect(result.skipped).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("counts database errors", async () => {
    mockFetchChannelMessages.mockResolvedValueOnce([
      {
        ts: "1706745600.000100",
        text: "Concert tonight!",
        user: "U12345",
        permalink: "https://slack.com/archives/C123/p1",
      },
    ]);

    mockParseEventFromText.mockResolvedValueOnce({
      title: "Test Event",
      description: null,
      date_start: "2026-02-01",
      time: "20:00",
      location: "Las Palmas",
      category: "music",
      image_url: null,
      source: "slack",
      source_url: "https://slack.com/archives/C123/p1",
    });

    mockUpsert.mockResolvedValueOnce({
      error: { message: "constraint violation" },
    });

    const result = await ingestFromSlack();

    expect(result.errors).toBe(1);
    expect(result.inserted).toBe(0);
  });

  it("throws when SLACK_CHANNEL_ID is not set", async () => {
    vi.stubEnv("SLACK_CHANNEL_ID", "");

    await expect(ingestFromSlack()).rejects.toThrow("SLACK_CHANNEL_ID is not set");
  });

  it("passes since parameter to fetchChannelMessages", async () => {
    mockFetchChannelMessages.mockResolvedValueOnce([]);

    const since = new Date("2026-01-15T00:00:00Z");
    await ingestFromSlack(since);

    expect(mockFetchChannelMessages).toHaveBeenCalledWith("C0123456789", since);
  });

  it("handles empty channel (no messages)", async () => {
    mockFetchChannelMessages.mockResolvedValueOnce([]);

    const result = await ingestFromSlack();

    expect(result.inserted).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toBe(0);
    expect(mockParseEventFromText).not.toHaveBeenCalled();
  });
});
