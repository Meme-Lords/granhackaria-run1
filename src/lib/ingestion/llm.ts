/**
 * Shared LLM helpers for ingestion: OpenAI/Anthropic provider selection,
 * retry on rate limit, and JSON response extraction.
 * Used by parser.ts and translate-event.ts.
 */

import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export type Provider = "openai" | "anthropic";

const MAX_RETRIES_ON_RATE_LIMIT = 3;
const RATE_LIMIT_WAIT_MS = 65_000;

let openaiClient: OpenAI | null = null;
let anthropicClient: Anthropic | null = null;

export function getProvider(): Provider | null {
  if (process.env.OPENAI_API_KEY) return "openai";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  return null;
}

export function getOpenAI(): OpenAI | null {
  if (!openaiClient && process.env.OPENAI_API_KEY) {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openaiClient;
}

export function getAnthropic(): Anthropic | null {
  if (!anthropicClient && process.env.ANTHROPIC_API_KEY) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return anthropicClient;
}

export function isRateLimitError(err: unknown): boolean {
  if (err == null || typeof err !== "object") return false;
  const o = err as { status?: number; code?: string };
  return o.status === 429 || o.code === "rate_limit_exceeded";
}

/**
 * Run fn with retry on 429. logPrefix is used in the warning message (e.g. "parser", "translate-event").
 */
export async function withRetryOn429<T>(
  fn: () => Promise<T>,
  logPrefix = "llm"
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES_ON_RATE_LIMIT; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRateLimitError(err) || attempt === MAX_RETRIES_ON_RATE_LIMIT) throw err;
      console.warn(
        `[${logPrefix}] Rate limited (429), pausing before resuming (retry ${attempt + 1}/${MAX_RETRIES_ON_RATE_LIMIT})`
      );
      await new Promise((r) => setTimeout(r, RATE_LIMIT_WAIT_MS));
    }
  }
  throw lastError;
}

/** Strip markdown code fences if present (e.g. ```json ... ```). */
export function extractJsonText(raw: string): string {
  const trimmed = raw.trim();
  const fence = trimmed.startsWith("```")
    ? trimmed.slice(3).replace(/^json\s*\n?/i, "").trim()
    : trimmed;
  return fence.endsWith("```") ? fence.slice(0, -3).trim() : fence;
}
