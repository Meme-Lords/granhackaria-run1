import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchAccountPosts } from "./instagram";
import { parseEventFromText } from "./parser";
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
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, key);
}

async function upsertEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  event: RawEvent
): Promise<"inserted" | "skipped" | "error"> {
  const { error } = await supabase.from("events").upsert(
    {
      title: event.title,
      description: event.description,
      date_start: event.date_start,
      time: event.time,
      location: event.location,
      category: event.category,
      image_url: event.image_url,
      source: event.source,
      source_url: event.source_url,
    },
    { onConflict: "source_url", ignoreDuplicates: true }
  );

  if (error) {
    console.error(`[pipeline] Failed to insert event "${event.title}":`, error.message);
    return "error";
  }

  return "inserted";
}

export async function ingestFromInstagram(
  accounts: string[]
): Promise<PipelineResult> {
  const supabase = createSupabaseAdmin();
  const result: PipelineResult = { inserted: 0, skipped: 0, errors: 0 };

  for (const account of accounts) {
    console.log(`[pipeline] Fetching posts from @${account}...`);
    const posts = await fetchAccountPosts(account);
    console.log(`[pipeline] Got ${posts.length} posts from @${account}`);

    for (const post of posts) {
      if (!post.caption) {
        console.log(`[pipeline] Skipping post ${post.id} (no caption)`);
        result.skipped++;
        continue;
      }

      console.log(`[pipeline] Parsing post ${post.id}...`);
      const event = await parseEventFromText(
        post.caption,
        "instagram",
        post.permalink,
        post.image_url
      );

      if (!event) {
        console.log(`[pipeline] Post ${post.id} is not an event, skipping`);
        result.skipped++;
        continue;
      }

      console.log(`[pipeline] Inserting event: "${event.title}"`);
      const status = await upsertEvent(supabase, event);

      if (status === "error") {
        result.errors++;
      } else {
        result.inserted++;
      }
    }
  }

  return result;
}

// Run as standalone script: npx tsx src/lib/ingestion/instagram-pipeline.ts
const isMainModule =
  typeof require !== "undefined" &&
  require.main === module;

if (isMainModule) {
  // eslint-disable-next-line @typescript-eslint/no-require-requires
  require("dotenv").config({ path: ".env.local" });

  const accountsEnv = process.env.INSTAGRAM_ACCOUNTS;
  if (!accountsEnv) {
    console.error("INSTAGRAM_ACCOUNTS env var is required (comma-separated usernames)");
    process.exit(1);
  }

  const accounts = accountsEnv.split(",").map((a) => a.trim()).filter(Boolean);
  console.log(`[pipeline] Starting ingestion for accounts: ${accounts.join(", ")}`);

  ingestFromInstagram(accounts)
    .then((result) => {
      console.log("\n[pipeline] Done!");
      console.log(`  Inserted: ${result.inserted}`);
      console.log(`  Skipped:  ${result.skipped}`);
      console.log(`  Errors:   ${result.errors}`);
    })
    .catch((error) => {
      console.error("[pipeline] Fatal error:", error);
      process.exit(1);
    });
}
