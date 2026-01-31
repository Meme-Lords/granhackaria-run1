import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockConversationsHistory, mockGetPermalink } = vi.hoisted(() => ({
  mockConversationsHistory: vi.fn(),
  mockGetPermalink: vi.fn(),
}));

vi.mock("@slack/web-api", () => ({
  WebClient: class MockWebClient {
    conversations = { history: mockConversationsHistory };
    chat = { getPermalink: mockGetPermalink };
  },
}));

import { fetchChannelMessages } from "../slack";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SLACK_BOT_TOKEN", "xoxb-test-token");
});

describe("fetchChannelMessages", () => {
  it("returns parsed messages from channel history", async () => {
    mockConversationsHistory.mockResolvedValueOnce({
      messages: [
        {
          type: "message",
          ts: "1706745600.000100",
          text: "Live music at Vegueta tonight at 8pm!",
          user: "U12345",
        },
        {
          type: "message",
          ts: "1706745700.000200",
          text: "Art exhibition opening Saturday",
          user: "U67890",
        },
      ],
    });

    mockGetPermalink
      .mockResolvedValueOnce({
        permalink: "https://slack.com/archives/C123/p1706745600000100",
      })
      .mockResolvedValueOnce({
        permalink: "https://slack.com/archives/C123/p1706745700000200",
      });

    const messages = await fetchChannelMessages("C123");

    expect(messages).toHaveLength(2);
    expect(messages[0]).toEqual({
      ts: "1706745600.000100",
      text: "Live music at Vegueta tonight at 8pm!",
      user: "U12345",
      permalink: "https://slack.com/archives/C123/p1706745600000100",
    });
    expect(messages[1]).toEqual({
      ts: "1706745700.000200",
      text: "Art exhibition opening Saturday",
      user: "U67890",
      permalink: "https://slack.com/archives/C123/p1706745700000200",
    });
  });

  it("returns empty array when SLACK_BOT_TOKEN is not set", async () => {
    vi.stubEnv("SLACK_BOT_TOKEN", "");

    vi.resetModules();
    const mod = await import("../slack");
    const messages = await mod.fetchChannelMessages("C123");

    expect(messages).toEqual([]);
  });

  it("filters out bot messages and system messages", async () => {
    mockConversationsHistory.mockResolvedValueOnce({
      messages: [
        {
          type: "message",
          ts: "1706745600.000100",
          text: "Real event message",
          user: "U12345",
        },
        {
          type: "message",
          subtype: "channel_join",
          ts: "1706745700.000200",
          text: "User joined the channel",
          user: "U67890",
        },
        {
          type: "message",
          subtype: "bot_message",
          ts: "1706745800.000300",
          text: "Bot notification",
        },
      ],
    });

    mockGetPermalink.mockResolvedValueOnce({
      permalink: "https://slack.com/archives/C123/p1706745600000100",
    });

    const messages = await fetchChannelMessages("C123");

    expect(messages).toHaveLength(1);
    expect(messages[0].text).toBe("Real event message");
  });

  it("filters out empty messages", async () => {
    mockConversationsHistory.mockResolvedValueOnce({
      messages: [
        {
          type: "message",
          ts: "1706745600.000100",
          text: "",
          user: "U12345",
        },
        {
          type: "message",
          ts: "1706745700.000200",
          text: "   ",
          user: "U67890",
        },
      ],
    });

    const messages = await fetchChannelMessages("C123");

    expect(messages).toHaveLength(0);
  });

  it("passes since parameter as oldest timestamp", async () => {
    mockConversationsHistory.mockResolvedValueOnce({ messages: [] });

    const since = new Date("2026-01-15T00:00:00Z");
    await fetchChannelMessages("C123", since);

    expect(mockConversationsHistory).toHaveBeenCalledWith(
      expect.objectContaining({
        channel: "C123",
        oldest: String(since.getTime() / 1000),
      })
    );
  });

  it("returns empty array on API error", async () => {
    mockConversationsHistory.mockRejectedValueOnce(new Error("API error"));

    const messages = await fetchChannelMessages("C123");

    expect(messages).toEqual([]);
  });

  it("handles permalink fetch failure gracefully", async () => {
    mockConversationsHistory.mockResolvedValueOnce({
      messages: [
        {
          type: "message",
          ts: "1706745600.000100",
          text: "Event tonight!",
          user: "U12345",
        },
      ],
    });

    mockGetPermalink.mockRejectedValueOnce(new Error("not_allowed"));

    const messages = await fetchChannelMessages("C123");

    expect(messages).toHaveLength(1);
    expect(messages[0].permalink).toBeNull();
  });
});
