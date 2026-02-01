import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchChannelMessages } from "./slack";
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
  const { error } = await supabase.from("events").upsert(
    {
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
    },
    { onConflict: "source_url", ignoreDuplicates: true }
  );

  if (error) {
    console.error(`[slack-pipeline] Failed to insert event "${event.title}":`, error.message);
    return "error";
  }

  return "inserted";
}

export async function ingestFromSlack(
  since?: Date
): Promise<PipelineResult> {
  const channelId = process.env.SLACK_CHANNEL_ID;
  if (!channelId) {
    throw new Error("SLACK_CHANNEL_ID is not set");
  }

  const supabase = createSupabaseAdmin();
  const result: PipelineResult = { inserted: 0, skipped: 0, errors: 0 };

  console.log(`[slack-pipeline] Fetching messages from channel ${channelId}...`);
  const messages = await fetchChannelMessages(channelId, since);
  console.log(`[slack-pipeline] Got ${messages.length} messages`);

  for (const msg of messages) {
    console.log(`[slack-pipeline] Parsing message ${msg.ts}...`);
    const event = await parseEventFromText(
      msg.text,
      "slack",
      msg.permalink,
      null
    );

    if (!event) {
      console.log(`[slack-pipeline] Message ${msg.ts} is not an event, skipping`);
      result.skipped++;
      continue;
    }

    console.log(`[slack-pipeline] Inserting event: "${event.title}"`);
    const status = await upsertEvent(supabase, event);

    if (status === "error") {
      result.errors++;
    } else {
      result.inserted++;
    }
  }

  return result;
}

// Run as standalone script: npx tsx src/lib/ingestion/slack-pipeline.ts
const isMainModule =
  typeof require !== "undefined" &&
  require.main === module;

if (isMainModule) {
  // eslint-disable-next-line @typescript-eslint/no-require-requires
  require("dotenv").config({ path: ".env.local" });

  const channelId = process.env.SLACK_CHANNEL_ID;
  if (!channelId) {
    console.error("SLACK_CHANNEL_ID env var is required");
    process.exit(1);
  }

  // Optional: pass --since=YYYY-MM-DD to limit messages
  const sinceArg = process.argv.find((a) => a.startsWith("--since="));
  const since = sinceArg ? new Date(sinceArg.split("=")[1]) : undefined;

  console.log(`[slack-pipeline] Starting Slack ingestion for channel ${channelId}`);
  if (since) {
    console.log(`[slack-pipeline] Fetching messages since ${since.toISOString()}`);
  }

  ingestFromSlack(since)
    .then((result) => {
      console.log("\n[slack-pipeline] Done!");
      console.log(`  Inserted: ${result.inserted}`);
      console.log(`  Skipped:  ${result.skipped}`);
      console.log(`  Errors:   ${result.errors}`);
    })
    .catch((error) => {
      console.error("[slack-pipeline] Fatal error:", error);
      process.exit(1);
    });
}
