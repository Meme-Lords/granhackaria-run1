import Anthropic from "@anthropic-ai/sdk";
import type { RawEvent } from "./types";

const VALID_CATEGORIES = [
  "music",
  "arts",
  "food",
  "sports",
  "festival",
  "theater",
  "workshop",
  "market",
] as const;

const SYSTEM_PROMPT = `You are an event data extractor for Gran Canaria, Spain. Given an Instagram caption, extract structured event information.

Return a JSON object with these fields:
- title: string (event name, concise)
- description: string | null (brief description if available)
- date_start: string (ISO date YYYY-MM-DD)
- time: string | null (HH:MM in 24h format, or null if not mentioned)
- location: string (venue or place name)
- category: one of: music, arts, food, sports, festival, theater, workshop, market

If the text is NOT about an event (e.g., it's a personal post, meme, promotional content without a specific event), return exactly: {"not_event": true}

Rules:
- If no specific date is mentioned, try to infer from context (e.g., "this Saturday", "mañana"). Use today's date as reference.
- If location is unclear, use "Gran Canaria" as default.
- Pick the most fitting category. When unsure, use "festival" for general gatherings.
- Handle both Spanish and English captions.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

let client: Anthropic | null = null;

function getClient(): Anthropic | null {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[parser] ANTHROPIC_API_KEY is not set");
      return null;
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

export async function parseEventFromText(
  text: string,
  source: "instagram" | "slack" | "manual",
  sourceUrl: string | null = null,
  imageUrl: string | null = null
): Promise<RawEvent | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  if (!text || text.trim().length < 10) {
    return null;
  }

  try {
    const today = new Date().toISOString().split("T")[0];

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Today's date is ${today}.\n\nCaption:\n${text}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") return null;

    const parsed = JSON.parse(content.text);

    if (parsed.not_event) return null;

    const category = VALID_CATEGORIES.includes(parsed.category)
      ? parsed.category
      : "festival";

    return {
      title: String(parsed.title),
      description: parsed.description ? String(parsed.description) : null,
      date_start: String(parsed.date_start),
      time: parsed.time ? String(parsed.time) : null,
      location: String(parsed.location || "Gran Canaria"),
      category,
      image_url: imageUrl,
      source,
      source_url: sourceUrl,
    };
  } catch (error) {
    console.warn("[parser] Failed to parse text:", error);
    return null;
  }
}
