import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { fetchMeetupEvents, transformMeetupEvent } from "./meetup";
import {
  fetchMeetupEventsFromApify,
  transformApifyMeetupItem,
} from "./meetup-apify";
import type { RawEvent } from "./types";

export interface PipelineResult {
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
): Promise<"inserted" | "error"> {
  const { error } = await supabase.from("events").upsert(
    {
      title: event.title,
      title_en: event.title_en,
      title_es: event.title_es,
      description: event.description,
      description_en: event.description_en,
      description_es: event.description_es,
      source_language: event.source_language,
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
    console.error(`[meetup-pipeline] Failed to upsert event "${event.title}":`, error.message);
    return "error";
  }

  return "inserted";
}

/**
 * Ingest events from Meetup.com for Gran Canaria.
 * Uses OAuth+GraphQL when MEETUP_CLIENT_ID and MEETUP_REFRESH_TOKEN are set;
 * otherwise uses Apify meetup-scraper when APIFY_API_TOKEN is set.
 */
export async function ingestFromMeetup(): Promise<PipelineResult> {
  const clientId = process.env.MEETUP_CLIENT_ID;
  const refreshToken = process.env.MEETUP_REFRESH_TOKEN;
  const apifyToken = process.env.APIFY_API_TOKEN;

  const useOAuth = !!(clientId && refreshToken);
  const useApify = !!apifyToken;

  if (!useOAuth && !useApify) {
    throw new Error(
      "Meetup: set MEETUP_CLIENT_ID and MEETUP_REFRESH_TOKEN (OAuth) or APIFY_API_TOKEN (Apify scraper)"
    );
  }

  const supabase = createSupabaseAdmin();
  const result: PipelineResult = { inserted: 0, skipped: 0, errors: 0 };

  if (useOAuth) {
    console.log("[meetup-pipeline] Fetching Meetup events via GraphQL (Gran Canaria)...");
    const rawEvents = await fetchMeetupEvents();
    console.log(`[meetup-pipeline] Got ${rawEvents.length} events`);

    for (const raw of rawEvents) {
      const event = transformMeetupEvent(raw);
      const outcome = await processEvent(supabase, event, result);
      if (outcome === "continue") continue;
    }
  } else {
    console.log("[meetup-pipeline] Fetching Meetup events via Apify scraper (Gran Canaria)...");
    const items = await fetchMeetupEventsFromApify();
    console.log(`[meetup-pipeline] Got ${items.length} events`);

    for (const item of items) {
      const event = transformApifyMeetupItem(item);
      const outcome = await processEvent(supabase, event, result);
      if (outcome === "continue") continue;
    }
  }

  return result;
}


async function processEvent(
  supabase: SupabaseClient<any>,
  event: RawEvent,
  result: PipelineResult
): Promise<"continue" | void> {
  if (!event.date_start?.trim()) {
    console.log(`[meetup-pipeline] Skipping event "${event.title}" (no valid date)`);
    result.skipped++;
    return "continue";
  }
  if (!event.source_url) {
    console.log(`[meetup-pipeline] Skipping event "${event.title}" (no event URL)`);
    result.skipped++;
    return "continue";
  }
  console.log(`[meetup-pipeline] Upserting event: "${event.title}"`);
  const status = await upsertEvent(supabase, event);
  if (status === "error") {
    result.errors++;
  } else {
    result.inserted++;
  }
}

// Run as standalone script: npx tsx src/lib/ingestion/meetup-pipeline.ts
const isMainModule =
  typeof require !== "undefined" &&
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (require as any).main === module;

if (isMainModule) {
  require("dotenv").config({ path: ".env" });
  require("dotenv").config({ path: ".env.local" });

  const hasOAuth =
    !!process.env.MEETUP_CLIENT_ID &&
    !!process.env.MEETUP_CLIENT_SECRET &&
    !!process.env.MEETUP_REFRESH_TOKEN;
  const hasApify = !!process.env.APIFY_API_TOKEN;

  if (!hasOAuth && !hasApify) {
    console.error(
      "[meetup-pipeline] Set MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN (OAuth) or APIFY_API_TOKEN (Apify scraper) in .env or .env.local"
    );
    process.exit(1);
  }

  console.log(
    "[meetup-pipeline] Starting Meetup ingestion for Gran Canaria",
    hasOAuth ? "(OAuth)" : "(Apify scraper)"
  );

  ingestFromMeetup()
    .then((res) => {
      console.log("\n[meetup-pipeline] Done!");
      console.log(`  Inserted: ${res.inserted}`);
      console.log(`  Skipped:  ${res.skipped}`);
      console.log(`  Errors:   ${res.errors}`);
    })
    .catch((err) => {
      console.error("[meetup-pipeline] Fatal error:", err);
      process.exit(1);
    });
}
