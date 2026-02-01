import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
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
- ticket_price: string | null (e.g. "15€", "Free", "From 10€", or null if not mentioned)
- category: one of: music, arts, food, sports, festival, theater, workshop, market

If the text is NOT about an event (e.g., it's a personal post, meme, promotional content without a specific event), return exactly: {"not_event": true}

Rules:
- If no specific date is mentioned, try to infer from context (e.g., "this Saturday", "mañana"). Use today's date as reference.
- If location is unclear, use "Gran Canaria" as default.
- Pick the most fitting category. When unsure, use "festival" for general gatherings.
- Handle both Spanish and English captions.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

const VISION_SYSTEM_PROMPT = `You are an event data extractor for Gran Canaria, Spain. Look at the image (e.g. event poster, flyer, ticket, photo of a venue or announcement).

If the image shows or advertises a specific event, extract structured event information and return a JSON object with these fields:
- title: string (event name, concise)
- description: string | null (brief description if visible)
- date_start: string (ISO date YYYY-MM-DD)
- time: string | null (HH:MM in 24h format, or null if not visible)
- location: string (venue or place name)
- ticket_price: string | null (e.g. "15€", "Free", "From 10€", or null if not visible)
- category: one of: music, arts, food, sports, festival, theater, workshop, market

If the image does NOT show a specific event (e.g. personal photo, meme, generic promo, no date/venue), return exactly: {"not_event": true}

Rules:
- Infer date/time from text in the image when possible. Use today's date as reference for relative dates.
- If location is unclear, use "Gran Canaria" as default.
- Pick the most fitting category. When unsure, use "festival".
- Handle Spanish and English text in the image.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

type Provider = "openai" | "anthropic";

const MAX_RETRIES_ON_RATE_LIMIT = 3;
/** Wait 1 min 5 sec on 429 before resuming (OpenAI TPM reset is typically ~1 min). */
const RATE_LIMIT_WAIT_MS = 65_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRateLimitError(err: unknown): boolean {
  if (err == null || typeof err !== "object") return false;
  const o = err as { status?: number; code?: string };
  return o.status === 429 || o.code === "rate_limit_exceeded";
}

async function withRetryOn429<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES_ON_RATE_LIMIT; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRateLimitError(err) || attempt === MAX_RETRIES_ON_RATE_LIMIT) throw err;
      console.warn(
        `[parser] Rate limited (429), pausing 1m 5s before resuming (retry ${attempt + 1}/${MAX_RETRIES_ON_RATE_LIMIT})`
      );
      await sleep(RATE_LIMIT_WAIT_MS);
    }
  }
  throw lastError;
}

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

function getProvider(): Provider | null {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

function getOpenAI(): OpenAI | null {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

function getAnthropic(): Anthropic | null {
  if (!anthropicClient) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      console.error("[parser] ANTHROPIC_API_KEY is not set");
      return null;
    }
    anthropicClient = new Anthropic({ apiKey });
  }
  return anthropicClient;
}

/** Fetch image from URL and return base64 + media type for Anthropic. */
async function fetchImageAsBase64(
  url: string
): Promise<{ data: string; mediaType: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const buf = await res.arrayBuffer();
    const base64 = Buffer.from(buf).toString("base64");
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const mediaType = contentType.split(";")[0].trim();
    return { data: base64, mediaType };
  } catch {
    return null;
  }
}

/** Strip markdown code fences if present (e.g. ```json ... ```). */
function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.startsWith("```") ? trimmed.slice(3).replace(/^json\s*\n?/i, "") : trimmed;
  return fence.endsWith("```") ? fence.slice(0, -3).trim() : fence;
}

function parseResponseToEvent(
  parsed: Record<string, unknown>,
  imageUrl: string | null,
  source: "instagram" | "slack" | "manual",
  sourceUrl: string | null
): RawEvent | null {
  if (parsed.not_event) return null;

  const category = VALID_CATEGORIES.includes(parsed.category as (typeof VALID_CATEGORIES)[number])
    ? (parsed.category as (typeof VALID_CATEGORIES)[number])
    : "festival";

  const desc = parsed.description;
  const time = parsed.time;
  const loc = parsed.location;
  const ticketPrice = parsed.ticket_price;

  const title = parsed.title;
  const dateStart = parsed.date_start;

  return {
    title: typeof title === "string" ? title : "",
    description: desc != null && typeof desc === "string" ? desc : null,
    date_start: typeof dateStart === "string" ? dateStart : "",
    time: time != null && typeof time === "string" ? time : null,
    location: typeof loc === "string" ? loc : "Gran Canaria",
    ticket_price: ticketPrice != null && typeof ticketPrice === "string" ? ticketPrice : null,
    category,
    image_url: imageUrl,
    source,
    source_url: sourceUrl,
  };
}

export async function parseEventFromText(
  text: string,
  source: "instagram" | "slack" | "manual",
  sourceUrl: string | null = null,
  imageUrl: string | null = null
): Promise<RawEvent | null> {
  const provider = getProvider();
  if (!provider) {
    console.error("[parser] Neither OPENAI_API_KEY nor ANTHROPIC_API_KEY is set");
    return null;
  }

  if (!text || text.trim().length < 10) {
    return null;
  }

  const today = new Date().toISOString().split("T")[0];
  const userContent = `Today's date is ${today}.\n\nCaption:\n${text}`;

  let rawText: string;

  try {
    if (provider === "openai") {
      const openai = getOpenAI();
      if (!openai) return null;
      const completion = await withRetryOn429(() =>
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 512,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        })
      );
      const content = completion.choices[0]?.message?.content;
      if (!content) return null;
      rawText = extractJsonText(content);
    } else {
      const anthropic = getAnthropic();
      if (!anthropic) return null;
      const message = await withRetryOn429(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        })
      );
      const first = message.content[0];
      if (first.type !== "text") return null;
      rawText = extractJsonText(first.text);
    }

    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    return parseResponseToEvent(parsed, imageUrl, source, sourceUrl);
  } catch (error) {
    console.warn("[parser] Failed to parse text:", error);
    return null;
  }
}

/**
 * Analyze the post image with a vision model to extract event info (posters, flyers, etc.).
 * Use when caption parsing returned not_event but the post has an image.
 */
export async function parseEventFromImage(
  imageUrl: string,
  captionContext: string | null,
  source: "instagram" | "slack" | "manual",
  sourceUrl: string | null
): Promise<RawEvent | null> {
  const provider = getProvider();
  if (!provider) return null;

  const today = new Date().toISOString().split("T")[0];
  const contextLine = captionContext?.trim()
    ? `\nOptional caption context: ${captionContext.slice(0, 200)}${captionContext.length > 200 ? "…" : ""}`
    : "";

  let rawText: string;

  try {
    if (provider === "openai") {
      const openai = getOpenAI();
      if (!openai) return null;
      // Fetch image as base64 so OpenAI doesn't hit Instagram CDN (which returns invalid_image_url).
      const imageData = await fetchImageAsBase64(imageUrl);
      if (!imageData) {
        console.warn("[parser] Failed to fetch image for vision:", imageUrl.slice(0, 50));
        return null;
      }
      const dataUrl = `data:${imageData.mediaType};base64,${imageData.data}`;
      const completion = await withRetryOn429(() =>
        openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 512,
          messages: [
            { role: "system", content: VISION_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Today's date is ${today}.${contextLine}\n\nAnalyze the image and return JSON.`,
                },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
        })
      );
      const content = completion.choices[0]?.message?.content;
      if (!content) return null;
      rawText = extractJsonText(content);
    } else {
      const anthropic = getAnthropic();
      if (!anthropic) return null;
      const imageData = await fetchImageAsBase64(imageUrl);
      if (!imageData) {
        console.warn("[parser] Failed to fetch image for vision:", imageUrl.slice(0, 50));
        return null;
      }
      const message = await withRetryOn429(() =>
        anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: VISION_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: imageData.mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                    data: imageData.data,
                  },
                },
                {
                  type: "text",
                  text: `Today's date is ${today}.${contextLine}\n\nAnalyze the image and return JSON.`,
                },
              ],
            },
          ],
        })
      );
      const first = message.content[0];
      if (first.type !== "text") return null;
      rawText = extractJsonText(first.text);
    }

    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    return parseResponseToEvent(parsed, imageUrl, source, sourceUrl);
  } catch (error) {
    console.warn("[parser] Failed to parse image:", error);
    return null;
  }
}
