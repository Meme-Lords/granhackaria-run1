/**
 * Cron job: check events' source_url and set source_url_gone when URL returns 404/410.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { checkSourceUrlStatus } from "./source-url-health";

const BATCH_SIZE = 30;

function createSupabaseAdmin(): SupabaseClient {
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

export interface MarkGoneResult {
  checked: number;
  marked: number;
  errors: number;
}

/**
 * Fetch a batch of events with source_url that are not yet marked gone,
 * HEAD-check each URL, and set source_url_gone = true for 404/410.
 */
export async function markGoneSourceUrls(options?: {
  limit?: number;
}): Promise<MarkGoneResult> {
  const limit = options?.limit ?? BATCH_SIZE;
  const supabase = createSupabaseAdmin();

  const { data: events, error: fetchError } = await supabase
    .from("events")
    .select("id, source_url")
    .not("source_url", "is", null)
    .or("source_url_gone.is.null,source_url_gone.eq.false")
    .limit(limit);

  if (fetchError) {
    console.error("[mark-gone-source-urls] Failed to fetch events:", fetchError.message);
    return { checked: 0, marked: 0, errors: 1 };
  }

  if (!events?.length) {
    return { checked: 0, marked: 0, errors: 0 };
  }

  let marked = 0;
  let errorCount = 0;

  for (const event of events) {
    const url = event.source_url as string;
    if (!url) continue;

    try {
      const status = await checkSourceUrlStatus(url);
      if (status === "gone") {
        const { error: updateError } = await supabase
          .from("events")
          .update({ source_url_gone: true })
          .eq("id", event.id);

        if (updateError) {
          console.error(`[mark-gone-source-urls] Failed to update event ${event.id}:`, updateError.message);
          errorCount += 1;
        } else {
          marked += 1;
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`[mark-gone-source-urls] Check failed for ${url}:`, message);
      errorCount += 1;
    }
  }

  return {
    checked: events.length,
    marked,
    errors: errorCount,
  };
}
