import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
});

function mockLLMResponse(text: string) {
  mockCreate.mockResolvedValueOnce({
    content: [{ type: "text", text }],
  });
}

describe("parseEventFromText", () => {
  it("parses an event caption into a RawEvent", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    mockLLMResponse(
      JSON.stringify({
        title: "Jazz Night at Vegueta",
        description: "Live jazz in the old town",
        date_start: "2026-02-01",
        time: "20:00",
        location: "Plaza de Santa Ana",
        category: "music",
      })
    );

    const result = await parseEventFromText(
      "Join us for Jazz Night at Vegueta! Live jazz in the old town. Feb 1st at 8pm, Plaza de Santa Ana.",
      "instagram",
      "https://instagram.com/p/ABC123/",
      "https://img.example.com/1.jpg"
    );

    expect(result).toEqual({
      title: "Jazz Night at Vegueta",
      description: "Live jazz in the old town",
      date_start: "2026-02-01",
      time: "20:00",
      location: "Plaza de Santa Ana",
      category: "music",
      image_url: "https://img.example.com/1.jpg",
      source: "instagram",
      source_url: "https://instagram.com/p/ABC123/",
    });
  });

  it("returns null for non-event posts", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    mockLLMResponse(JSON.stringify({ not_event: true }));

    const result = await parseEventFromText(
      "Beautiful sunset today! #grancanaria #nature",
      "instagram"
    );

    expect(result).toBeNull();
  });

  it("returns null for empty or very short text", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    const result = await parseEventFromText("Hi", "instagram");
    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns null when ANTHROPIC_API_KEY is not set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    const result = await parseEventFromText(
      "Concert tonight at 8pm in Vegueta!",
      "instagram"
    );

    expect(result).toBeNull();
  });

  it("defaults invalid category to festival", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    mockLLMResponse(
      JSON.stringify({
        title: "Fun Gathering",
        description: null,
        date_start: "2026-02-01",
        time: null,
        location: "Las Palmas",
        category: "party",
      })
    );

    const result = await parseEventFromText(
      "Fun gathering this weekend in Las Palmas!",
      "instagram"
    );

    expect(result?.category).toBe("festival");
  });

  it("handles LLM response parsing failure gracefully", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: "This is not valid JSON" }],
    });

    const result = await parseEventFromText(
      "Concert tonight at Auditorio Alfredo Kraus!",
      "instagram"
    );

    expect(result).toBeNull();
  });

  it("handles API errors gracefully", async () => {
    vi.resetModules();
    vi.doMock("@anthropic-ai/sdk", () => ({
      default: class MockAnthropic {
        messages = { create: mockCreate };
      },
    }));
    const { parseEventFromText } = await import("../parser");

    mockCreate.mockRejectedValueOnce(new Error("API rate limit"));

    const result = await parseEventFromText(
      "Workshop on pottery making this Saturday!",
      "instagram"
    );

    expect(result).toBeNull();
  });
});
