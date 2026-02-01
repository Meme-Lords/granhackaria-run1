import { describe, it, expect, vi, beforeEach } from "vitest";

const mockCreate = vi.fn();
const mockOpenAICreate = vi.fn();

vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate };
  },
}));

vi.mock("openai", () => ({
  default: class MockOpenAI {
    chat = { completions: { create: mockOpenAICreate } };
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("ANTHROPIC_API_KEY", "test-key");
  vi.stubEnv("OPENAI_API_KEY", "");
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
      ticket_price: null,
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

  it("returns null when neither OPENAI nor ANTHROPIC API key is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "");
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
        ticket_price: null,
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

  it("strips markdown code fences from LLM response", async () => {
    vi.resetModules();
    const { parseEventFromText } = await import("../parser");

    const eventJson = {
      title: "Fenced Event",
      description: "In fences",
      date_start: "2026-02-15",
      time: "19:00",
      location: "Teatro Cuyás",
      ticket_price: "10€",
      category: "theater",
    };
    mockLLMResponse("```json\n" + JSON.stringify(eventJson) + "\n```");

    const result = await parseEventFromText(
      "Theater night at Teatro Cuyás, Feb 15 at 7pm. Tickets 10€.",
      "instagram"
    );

    expect(result).toMatchObject({
      title: "Fenced Event",
      description: "In fences",
      date_start: "2026-02-15",
      time: "19:00",
      location: "Teatro Cuyás",
      ticket_price: "10€",
      category: "theater",
    });
  });

  it("defaults missing or invalid fields in LLM response", async () => {
    vi.resetModules();
    const { parseEventFromText } = await import("../parser");

    mockLLMResponse(
      JSON.stringify({
        title: null,
        description: null,
        date_start: "2026-03-01",
        time: null,
        location: 123,
        ticket_price: null,
        category: "music",
      })
    );

    const result = await parseEventFromText(
      "Concert coming in March, venue TBA.",
      "slack",
      "https://slack.com/msg"
    );

    expect(result).toMatchObject({
      title: "",
      description: null,
      date_start: "2026-03-01",
      time: null,
      location: "Gran Canaria",
      ticket_price: null,
      category: "music",
      source: "slack",
      source_url: "https://slack.com/msg",
    });
  });

  it("uses OpenAI when OPENAI_API_KEY is set", async () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.resetModules();
    const { parseEventFromText } = await import("../parser");

    mockOpenAICreate.mockResolvedValueOnce({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: "OpenAI Jazz Night",
              description: "Live music",
              date_start: "2026-02-20",
              time: "21:00",
              location: "Casa de Colón",
              ticket_price: "Free",
              category: "music",
            }),
          },
        },
      ],
    });

    const result = await parseEventFromText(
      "Jazz night at Casa de Colón, Feb 20 at 9pm. Free entry.",
      "instagram"
    );

    expect(result).toMatchObject({
      title: "OpenAI Jazz Night",
      location: "Casa de Colón",
      ticket_price: "Free",
      category: "music",
    });
    expect(mockOpenAICreate).toHaveBeenCalled();
  });

  it("returns null when OpenAI returns empty content", async () => {
    vi.stubEnv("OPENAI_API_KEY", "openai-key");
    vi.resetModules();
    const { parseEventFromText } = await import("../parser");

    mockOpenAICreate.mockResolvedValueOnce({
      choices: [{ message: { content: null } }],
    });

    const result = await parseEventFromText(
      "Another long enough caption for the minimum length.",
      "instagram"
    );

    expect(result).toBeNull();
  });
});

describe("parseEventFromImage", () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch);
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
      headers: { get: (name: string) => (name === "content-type" ? "image/png" : null) },
    });
  });

  it("extracts event from image via Anthropic vision", async () => {
    vi.resetModules();
    const { parseEventFromImage } = await import("../parser");

    mockCreate.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            title: "Poster Event",
            description: "From poster",
            date_start: "2026-04-10",
            time: "20:00",
            location: "Auditorio",
            ticket_price: "15€",
            category: "music",
          }),
        },
      ],
    });

    const result = await parseEventFromImage(
      "https://example.com/poster.png",
      "Optional caption context",
      "instagram",
      "https://instagram.com/p/XYZ/"
    );

    expect(result).toMatchObject({
      title: "Poster Event",
      description: "From poster",
      date_start: "2026-04-10",
      time: "20:00",
      location: "Auditorio",
      ticket_price: "15€",
      category: "music",
      source: "instagram",
      source_url: "https://instagram.com/p/XYZ/",
    });
    expect(mockFetch).toHaveBeenCalledWith("https://example.com/poster.png");
  });

  it("returns null when image fetch fails", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false });
    vi.resetModules();
    const { parseEventFromImage } = await import("../parser");

    const result = await parseEventFromImage(
      "https://example.com/bad.png",
      null,
      "instagram",
      null
    );

    expect(result).toBeNull();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns null when no API key is set", async () => {
    vi.stubEnv("ANTHROPIC_API_KEY", "");
    vi.stubEnv("OPENAI_API_KEY", "");
    vi.resetModules();
    const { parseEventFromImage } = await import("../parser");

    const result = await parseEventFromImage(
      "https://example.com/poster.png",
      null,
      "instagram",
      null
    );

    expect(result).toBeNull();
  });

  it("returns null for not_event from vision", async () => {
    vi.resetModules();
    const { parseEventFromImage } = await import("../parser");

    mockCreate.mockResolvedValueOnce({
      content: [{ type: "text", text: JSON.stringify({ not_event: true }) }],
    });

    const result = await parseEventFromImage(
      "https://example.com/selfie.png",
      null,
      "instagram",
      null
    );

    expect(result).toBeNull();
  });
});
