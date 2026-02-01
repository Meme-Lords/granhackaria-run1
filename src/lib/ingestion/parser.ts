import type { RawEvent } from "./types";
import {
  extractJsonText,
  getAnthropic,
  getOpenAI,
  getProvider,
  withRetryOn429,
} from "./llm";

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

const SYSTEM_PROMPT = `You are an event data extractor for Gran Canaria, Spain. Given an Instagram caption, extract structured event information and provide BILINGUAL (English + Spanish) titles and descriptions.

Return a JSON object with these fields:
- title_en: string (event name in English, concise)
- title_es: string (event name in Spanish, concise)
- description_en: string | null (brief description in English if available)
- description_es: string | null (brief description in Spanish if available)
- source_language: "en" | "es" | "unknown" (detected language of the original text)
- date_start: string (ISO date YYYY-MM-DD)
- time: string | null (HH:MM in 24h format, or null if not mentioned)
- location: string (venue or place name)
- ticket_price: string | null (e.g. "15€", "Free", "From 10€", or null if not mentioned)
- category: one of: music, arts, food, sports, festival, theater, workshop, market

If the text is NOT about an event (e.g., it's a personal post, meme, promotional content without a specific event), return exactly: {"not_event": true}

Rules:
- Detect the source language. If Spanish, keep the original as _es fields and translate to _en. If English, keep as _en and translate to _es.
- Translations must be natural and culturally appropriate, not literal word-for-word.
- If no specific date is mentioned, try to infer from context (e.g., "this Saturday", "mañana"). Use today's date as reference.
- If location is unclear, use "Gran Canaria" as default.
- Pick the most fitting category. When unsure, use "festival" for general gatherings.
- Handle both Spanish and English captions.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

const VISION_SYSTEM_PROMPT = `You are an event data extractor for Gran Canaria, Spain. Look at the image (e.g. event poster, flyer, ticket, photo of a venue or announcement).

If the image shows or advertises a specific event, extract structured event information and provide BILINGUAL (English + Spanish) titles and descriptions. Return a JSON object with these fields:
- title_en: string (event name in English, concise)
- title_es: string (event name in Spanish, concise)
- description_en: string | null (brief description in English if visible)
- description_es: string | null (brief description in Spanish if visible)
- source_language: "en" | "es" | "unknown" (detected language of text in the image)
- date_start: string (ISO date YYYY-MM-DD)
- time: string | null (HH:MM in 24h format, or null if not visible)
- location: string (venue or place name)
- ticket_price: string | null (e.g. "15€", "Free", "From 10€", or null if not visible)
- category: one of: music, arts, food, sports, festival, theater, workshop, market

If the image does NOT show a specific event (e.g. personal photo, meme, generic promo, no date/venue), return exactly: {"not_event": true}

Rules:
- Detect the source language. If Spanish, keep the original as _es fields and translate to _en. If English, keep as _en and translate to _es.
- Translations must be natural and culturally appropriate, not literal word-for-word.
- Infer date/time from text in the image when possible. Use today's date as reference for relative dates.
- If location is unclear, use "Gran Canaria" as default.
- Pick the most fitting category. When unsure, use "festival".
- Handle Spanish and English text in the image.
- Return ONLY valid JSON, no markdown fences, no explanation.`;

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

  const time = parsed.time;
  const loc = parsed.location;
  const ticketPrice = parsed.ticket_price;
  const dateStart = parsed.date_start;

  // Bilingual fields
  const titleEn = typeof parsed.title_en === "string" ? parsed.title_en : "";
  const titleEs = typeof parsed.title_es === "string" ? parsed.title_es : "";
  const descEn = typeof parsed.description_en === "string" ? parsed.description_en : null;
  const descEs = typeof parsed.description_es === "string" ? parsed.description_es : null;

  const validLangs = ["en", "es", "unknown"] as const;
  const srcLang = validLangs.includes(parsed.source_language as typeof validLangs[number])
    ? (parsed.source_language as "en" | "es" | "unknown")
    : "unknown";

  // Fallback title/description: prefer source language, then en, then es
  const title = srcLang === "es" ? (titleEs || titleEn) : (titleEn || titleEs);
  const description = srcLang === "es" ? (descEs ?? descEn) : (descEn ?? descEs);

  return {
    title,
    title_en: titleEn,
    title_es: titleEs,
    description,
    description_en: descEn,
    description_es: descEs,
    source_language: srcLang,
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
      const completion = await withRetryOn429(
        () =>
          openai.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 512,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userContent },
            ],
          }),
        "parser"
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
      const completion = await withRetryOn429(
        () =>
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
          }),
        "parser"
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
      const message = await withRetryOn429(
        () =>
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
          }),
        "parser"
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
