/**
 * Translate event title and description to English and Spanish using OpenAI or Anthropic.
 * Used by the Meetup pipeline when source only provides one language (source_language unknown).
 */

import {
  extractJsonText,
  getAnthropic,
  getOpenAI,
  getProvider,
  withRetryOn429,
} from "./llm";

const TRANSLATE_SYSTEM_PROMPT = `You are a translator for event listings in Gran Canaria, Spain. Given an event title and optional description, provide short translations in English and Spanish.

Return ONLY a JSON object with these fields (no markdown, no explanation):
- title_en: string (event name in English, concise)
- title_es: string (event name in Spanish, concise)
- description_en: string | null (brief description in English; null if input description was empty)
- description_es: string | null (brief description in Spanish; null if input description was empty)
- source_language: "en" | "es" | "unknown" (detected language of the input)

Rules:
- Detect the source language. If Spanish, keep the original as title_es/description_es and translate to en. If English, keep as title_en/description_en and translate to es. If unclear, set source_language "unknown" and provide both.
- Keep titles concise (e.g. under 80 chars). Descriptions can be one or two sentences.
- Return ONLY valid JSON.`;

export interface TranslateResult {
  title_en: string;
  title_es: string;
  description_en: string | null;
  description_es: string | null;
  source_language: "en" | "es" | "unknown";
}

/**
 * Translate event title and description to English and Spanish.
 * Returns null if no API key, or on parse/API error (caller keeps original event fields).
 */
export async function translateEventToBilingual(
  title: string,
  description: string | null
): Promise<TranslateResult | null> {
  const provider = getProvider();
  if (!provider) return null;

  const trimmedTitle = title?.trim() || "Untitled Event";
  const trimmedDesc = description?.trim() || null;
  const userContent = trimmedDesc
    ? `Title: ${trimmedTitle}\n\nDescription: ${trimmedDesc}`
    : `Title: ${trimmedTitle}\n\nDescription: (none)`;

  try {
    let rawText: string;
    if (provider === "openai") {
      const openai = getOpenAI();
      if (!openai) return null;
      const completion = await withRetryOn429(
        () =>
          openai.chat.completions.create({
          model: "gpt-4o-mini",
          max_tokens: 512,
          messages: [
            { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
            { role: "user", content: userContent },
          ],
        }),
        "translate-event"
      );
      const content = completion.choices[0]?.message?.content;
      if (!content) return null;
      rawText = extractJsonText(content);
    } else {
      const anthropic = getAnthropic();
      if (!anthropic) return null;
      const message = await withRetryOn429(
        () =>
          anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 512,
          system: TRANSLATE_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        }),
        "translate-event"
      );
      const first = message.content[0];
      if (first?.type !== "text") return null;
      rawText = extractJsonText(first.text);
    }

    const parsed = JSON.parse(rawText) as Record<string, unknown>;
    const title_en = typeof parsed.title_en === "string" ? parsed.title_en : trimmedTitle;
    const title_es = typeof parsed.title_es === "string" ? parsed.title_es : trimmedTitle;
    const description_en =
      parsed.description_en != null && typeof parsed.description_en === "string"
        ? parsed.description_en
        : null;
    const description_es =
      parsed.description_es != null && typeof parsed.description_es === "string"
        ? parsed.description_es
        : null;
    const source_language =
      parsed.source_language === "en" || parsed.source_language === "es"
        ? parsed.source_language
        : "unknown";

    return {
      title_en,
      title_es,
      description_en,
      description_es,
      source_language,
    };
  } catch (err) {
    console.warn("[translate-event] Translation failed:", err);
    return null;
  }
}
