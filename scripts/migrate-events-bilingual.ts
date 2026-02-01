/**
 * Migration script: Populate bilingual columns for existing events.
 *
 * For each event that has title/description but missing title_en/title_es,
 * detect the language and translate to the other language using AI.
 *
 * Usage:
 *   npx tsx scripts/migrate-events-bilingual.ts [--dry-run]
 *
 * Requires: OPENAI_API_KEY or ANTHROPIC_API_KEY; NEXT_PUBLIC_SUPABASE_URL;
 *           SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 */

import { config } from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

// Load env
const projectRoot = path.resolve(__dirname, "..");
config({ path: path.join(projectRoot, ".env") });
config({ path: path.join(projectRoot, ".env.local") });

const dryRun = process.argv.includes("--dry-run");

interface EventToMigrate {
  id: string;
  title: string;
  description: string | null;
  title_en: string | null;
  title_es: string | null;
}

type TranslationResult = Array<{
  id: string;
  source_language: string;
  title_en: string;
  title_es: string;
  description_en: string | null;
  description_es: string | null;
}>;

const SYSTEM_PROMPT = `You are a translator for event titles and descriptions in Gran Canaria, Spain. For each event, detect the source language and provide the translation to the other language. Return ONLY valid JSON, no markdown fences.`;

async function translateWithOpenAI(
  openai: OpenAI,
  eventsForPrompt: Array<{ id: string; title: string; description: string | null }>
): Promise<TranslationResult> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 2048,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Translate the following events. For each one:
1. Detect if the title/description is in English or Spanish
2. Provide title_en, title_es, description_en, description_es
3. Set source_language to "en" or "es" (or "unknown" if unclear)
4. Keep the original language as-is, translate to the other

Events: ${JSON.stringify(eventsForPrompt)}

Return a JSON array:
[{"id": "...", "source_language": "es", "title_en": "...", "title_es": "...", "description_en": "...", "description_es": "..."}]`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "";
  return parseTranslationResponse(text);
}

async function translateWithAnthropic(
  anthropic: Anthropic,
  eventsForPrompt: Array<{ id: string; title: string; description: string | null }>
): Promise<TranslationResult> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-20250514",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Translate the following events. For each one:
1. Detect if the title/description is in English or Spanish
2. Provide title_en, title_es, description_en, description_es
3. Set source_language to "en" or "es" (or "unknown" if unclear)
4. Keep the original language as-is, translate to the other

Events: ${JSON.stringify(eventsForPrompt)}

Return a JSON array:
[{"id": "...", "source_language": "es", "title_en": "...", "title_es": "...", "description_en": "...", "description_es": "..."}]`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type !== "text") {
    throw new Error("Unexpected response type");
  }
  return parseTranslationResponse(block.text.trim());
}

function parseTranslationResponse(jsonStr: string): TranslationResult {
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.slice(3).replace(/^json\s*\n?/i, "");
  }
  if (jsonStr.endsWith("```")) {
    jsonStr = jsonStr.slice(0, -3).trim();
  }
  return JSON.parse(jsonStr) as TranslationResult;
}

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY");
    process.exit(1);
  }

  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!openaiKey && !anthropicKey) {
    console.error("Missing OPENAI_API_KEY or ANTHROPIC_API_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const useOpenAI = Boolean(openaiKey);
  if (useOpenAI) {
    console.log("Using OpenAI for translation");
  } else {
    console.log("Using Anthropic for translation");
  }

  // Fetch events that need migration (missing bilingual fields)
  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, description, title_en, title_es")
    .is("title_en", null)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch events:", error.message);
    process.exit(1);
  }

  const toMigrate = events as EventToMigrate[];
  console.log(`Found ${toMigrate.length} events to migrate`);

  if (toMigrate.length === 0) {
    console.log("Nothing to do.");
    return;
  }

  if (dryRun) {
    console.log("[DRY RUN] Would migrate:");
    for (const e of toMigrate) {
      console.log(`  - ${e.id}: "${e.title}"`);
    }
    return;
  }

  // Process in batches of 10
  const BATCH_SIZE = 10;
  let migrated = 0;
  let errors = 0;

  for (let i = 0; i < toMigrate.length; i += BATCH_SIZE) {
    const batch = toMigrate.slice(i, i + BATCH_SIZE);
    console.log(`\nProcessing batch ${Math.floor(i / BATCH_SIZE) + 1} (${batch.length} events)...`);

    const eventsForPrompt = batch.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
    }));

    try {
      const translations = useOpenAI
        ? await translateWithOpenAI(new OpenAI({ apiKey: openaiKey! }), eventsForPrompt)
        : await translateWithAnthropic(new Anthropic({ apiKey: anthropicKey! }), eventsForPrompt);

      for (const t of translations) {
        const { error: updateError } = await supabase
          .from("events")
          .update({
            title_en: t.title_en,
            title_es: t.title_es,
            description_en: t.description_en,
            description_es: t.description_es,
            source_language: t.source_language,
          })
          .eq("id", t.id);

        if (updateError) {
          console.error(`  Failed to update event ${t.id}:`, updateError.message);
          errors++;
        } else {
          console.log(`  Updated: ${t.id} (${t.source_language}) "${t.title_en}"`);
          migrated++;
        }
      }
    } catch (err) {
      console.error("  Batch translation failed:", err);
      errors += batch.length;
    }

    // Small delay between batches to avoid rate limits
    if (i + BATCH_SIZE < toMigrate.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Errors:   ${errors}`);
  console.log(`  Total:    ${toMigrate.length}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
