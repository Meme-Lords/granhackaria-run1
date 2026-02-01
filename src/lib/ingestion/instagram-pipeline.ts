import path from "path";
import { fileURLToPath } from "url";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { getInstagramAccountsFromStatsig, getPostsDaysBackFromStatsig } from "@/lib/statsig/server";
import { fetchAccountPosts } from "./instagram";
import { parseEventFromText, parseEventFromImage } from "./parser";
import type { RawEvent } from "./types";

interface PipelineResult {
  inserted: number;
  skipped: number;
  errors: number;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createSupabaseAdmin(): SupabaseClient<any> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)"
    );
  }

  return createClient(url, key);
}

async function upsertEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  event: RawEvent
): Promise<"inserted" | "skipped" | "error"> {
  const { error } = await supabase.from("events").insert({
    title: event.title,
    description: event.description,
    date_start: event.date_start,
    time: event.time,
    location: event.location,
    category: event.category,
    ticket_price: event.ticket_price,
    image_url: event.image_url,
    source: event.source,
    source_url: event.source_url,
  });

  if (error) {
    if (error.code === "23505") {
      return "skipped";
    }
    console.error(`[pipeline] Failed to insert event "${event.title}":`, error.message);
    return "error";
  }

  return "inserted";
}

/** True if any of the required fields is missing (empty or null). */
function hasMissingRequiredFields(event: RawEvent): boolean {
  if (!event.title?.trim()) return true;
  if (!event.date_start?.trim()) return true;
  if (event.time == null) return true;
  if (event.description == null) return true;
  if (event.ticket_price == null) return true;
  return false;
}

/** Fill missing required fields in base from vision result. Vision is used only for gaps. */
function mergeVisionIntoEvent(base: RawEvent, fromVision: RawEvent): RawEvent {
  return {
    ...base,
    title: base.title?.trim() ? base.title : fromVision.title,
    date_start: base.date_start?.trim() ? base.date_start : fromVision.date_start,
    time: base.time != null ? base.time : fromVision.time,
    description: base.description != null ? base.description : fromVision.description,
    ticket_price: base.ticket_price != null ? base.ticket_price : fromVision.ticket_price,
  };
}

export async function ingestFromInstagram(
  accounts: string[]
): Promise<PipelineResult> {
  const supabase = createSupabaseAdmin();
  const result: PipelineResult = { inserted: 0, skipped: 0, errors: 0 };
  const daysBack = await getPostsDaysBackFromStatsig();
  const delayMs = Math.max(0, Number(process.env.PARSER_DELAY_MS) || 0);
  console.log(`[pipeline] posts_days_back: ${daysBack} (Statsig instagram_accounts.posts_days_back or env)`);
  if (delayMs > 0) {
    console.log(`[pipeline] delay between posts: ${delayMs}ms (PARSER_DELAY_MS)`);
  }

  for (const account of accounts) {
    console.log(`[pipeline] Fetching posts from @${account}...`);
    const posts = await fetchAccountPosts(account, 10, { daysBack });
    console.log(`[pipeline] Got ${posts.length} posts from @${account}`);

    for (const post of posts) {
      if (!post.caption) {
        console.log(`[pipeline] Skipping post ${post.id} (no caption)`);
        result.skipped++;
        continue;
      }

      console.log(`[pipeline] Parsing post ${post.id}...`);
      let event = await parseEventFromText(
        post.caption,
        "instagram",
        post.permalink,
        post.image_url
      );

      // If caption didn't yield an event, try vision once (when we have an image).
      if (!event && post.image_url) {
        console.log(`[pipeline] Caption not an event, trying visual analysis for post ${post.id}...`);
        event = await parseEventFromImage(
          post.image_url,
          post.caption,
          "instagram",
          post.permalink
        );
      }

      // If we have an event from caption but required fields are missing, run vision once and merge.
      if (event && hasMissingRequiredFields(event) && post.image_url) {
        const visionEvent = await parseEventFromImage(
          post.image_url,
          post.caption,
          "instagram",
          post.permalink
        );
        if (visionEvent) {
          event = mergeVisionIntoEvent(event, visionEvent);
        }
      }

      if (!event) {
        const snippet = post.caption?.slice(0, 80).replace(/\n/g, " ") ?? "(no caption)";
        console.log(`[pipeline] Post ${post.id} is not an event, skipping. Caption snippet: "${snippet}${(post.caption?.length ?? 0) > 80 ? "…" : ""}"`);
        result.skipped++;
        continue;
      }

      console.log(`[pipeline] Inserting event: "${event.title}"`);
      const status = await upsertEvent(supabase, event);

      if (status === "error") {
        result.errors++;
      } else if (status === "inserted") {
        result.inserted++;
      } else {
        result.skipped++;
      }

      if (delayMs > 0) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return result;
}

// Run as standalone script: npx tsx src/lib/ingestion/instagram-pipeline.ts [--timeout=600]
const isMainModule = process.argv[1]?.includes("instagram-pipeline") ?? false;

if (isMainModule) {
  // Load .env from project root (where package.json is), not cwd - so it works from any run folder
  const scriptDir =
    typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));
  const projectRoot = path.resolve(scriptDir, "..", "..", "..");
  const envPath = path.join(projectRoot, ".env");
  const envLocalPath = path.join(projectRoot, ".env.local");
  config({ path: envPath });
  config({ path: envLocalPath });

  async function run(): Promise<void> {
    const accounts = await getInstagramAccountsFromStatsig();
    if (accounts.length === 0) {
      console.error(
        "[pipeline] No Instagram accounts. Set Statsig instagram_accounts config or INSTAGRAM_ACCOUNTS env (comma-separated usernames)."
      );
      process.exit(1);
    }

    const hasRapid = !!process.env.RAPIDAPI_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;
    const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasSupabaseKey =
      !!process.env.SUPABASE_SECRET_KEY || !!process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log("[pipeline] Preflight:");
    console.log(`  Instagram accounts: ${accounts.length} (${accounts.join(", ")})`);
    console.log(`  RAPIDAPI_KEY: ${hasRapid ? "set" : "MISSING"}`);
    console.log(
      `  LLM: ${hasOpenAI ? "OPENAI_API_KEY (text + vision)" : hasAnthropic ? "ANTHROPIC_API_KEY (text + vision)" : "MISSING (set OPENAI_API_KEY or ANTHROPIC_API_KEY)"}`
    );
    console.log(`  Supabase URL: ${hasSupabaseUrl ? "set" : "MISSING"}`);
    console.log(
      `  Supabase key: ${hasSupabaseKey ? "set (SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY)" : "MISSING"}`
    );

    if (!hasRapid) {
      console.error("[pipeline] Aborting: RAPIDAPI_KEY is required to fetch Instagram posts.");
      process.exit(1);
    }
    if (!hasOpenAI && !hasAnthropic) {
      console.error(
        "[pipeline] Aborting: set OPENAI_API_KEY or ANTHROPIC_API_KEY for caption/image parsing."
      );
      process.exit(1);
    }
    if (!hasSupabaseUrl || !hasSupabaseKey) {
      console.error(
        "[pipeline] Aborting: NEXT_PUBLIC_SUPABASE_URL and Supabase service key are required."
      );
      process.exit(1);
    }

    const timeoutArg = process.argv.find((a) => a.startsWith("--timeout="));
    const timeoutSeconds = timeoutArg ? Number(timeoutArg.slice("--timeout=".length)) : undefined;
    const timeoutMs = timeoutSeconds != null && Number.isFinite(timeoutSeconds) ? timeoutSeconds * 1000 : undefined;

    if (timeoutMs != null) {
      console.log(`[pipeline] Starting ingestion (timeout: ${timeoutMs / 1000}s)…`);
    } else {
      console.log("[pipeline] Starting ingestion…");
    }

    const timeoutPromise =
      timeoutMs != null
        ? new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error(`Ingestion timed out after ${timeoutMs / 1000}s`)), timeoutMs);
          })
        : null;

    try {
      const result =
        timeoutPromise != null
          ? await Promise.race([ingestFromInstagram(accounts), timeoutPromise])
          : await ingestFromInstagram(accounts);
      console.log("\n[pipeline] Done!");
      console.log(`  Inserted: ${result.inserted}`);
      console.log(`  Skipped:  ${result.skipped}`);
      console.log(`  Errors:   ${result.errors}`);
    } catch (error) {
      console.error("[pipeline] Fatal error:", error);
      process.exit(1);
    }
  }

  run();
}
