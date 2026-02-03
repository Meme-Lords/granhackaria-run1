import { NextResponse } from "next/server";
import { getInstagramAccountsFromStatsig } from "@/lib/statsig/server";
import { ingestFromInstagram } from "@/lib/ingestion/instagram-pipeline";
import { ingestFromSlack } from "@/lib/ingestion/slack-pipeline";
import { ingestFromMeetup } from "@/lib/ingestion/meetup-pipeline";
import { markGoneSourceUrls } from "@/lib/mark-gone-source-urls";

// Vercel cron: Hobby plan runs once daily, Pro plan supports custom schedules.
// maxDuration in seconds for Vercel serverless function timeout.
export const maxDuration = 60;

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = new Date().toISOString();
  console.log(`[cron/ingest] Starting ingestion at ${startTime}`);

  let instagram: { inserted: number; skipped: number; errors: number } | { error: string } = {
    error: "not run",
  };
  let slack: { inserted: number; skipped: number; errors: number } | { error: string } = {
    error: "not run",
  };
  let meetup: { inserted: number; skipped: number; errors: number } | { error: string } = {
    error: "not run",
  };

  // Run Instagram ingestion (accounts from Statsig instagram_accounts config or INSTAGRAM_ACCOUNTS env)
  try {
    const accounts = await getInstagramAccountsFromStatsig();
    if (accounts.length > 0) {
      instagram = await ingestFromInstagram(accounts);
      console.log("[cron/ingest] Instagram result:", instagram);
    } else {
      instagram = { error: "Instagram accounts not configured (Statsig instagram_accounts or INSTAGRAM_ACCOUNTS)" };
      console.log("[cron/ingest] Skipping Instagram: no accounts from Statsig or env");
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/ingest] Instagram ingestion failed:", message);
    instagram = { error: message };
  }

  // Run Slack ingestion
  try {
    slack = await ingestFromSlack();
    console.log("[cron/ingest] Slack result:", slack);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/ingest] Slack ingestion failed:", message);
    slack = { error: message };
  }

  // Run Meetup ingestion (OAuth or Apify scraper)
  const hasMeetupCreds =
    !!process.env.MEETUP_CLIENT_ID && !!process.env.MEETUP_REFRESH_TOKEN;
  const hasApifyScraper = !!process.env.APIFY_API_TOKEN;
  if (hasMeetupCreds || hasApifyScraper) {
    try {
      meetup = await ingestFromMeetup();
      console.log("[cron/ingest] Meetup result:", meetup);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[cron/ingest] Meetup ingestion failed:", message);
      meetup = { error: message };
    }
  } else {
    meetup = {
      error:
        "Meetup not configured: set MEETUP_CLIENT_ID and MEETUP_REFRESH_TOKEN (OAuth) or APIFY_API_TOKEN (Apify scraper)",
    };
    console.log("[cron/ingest] Skipping Meetup: no OAuth or Apify credentials");
  }

  // Mark events whose source_url returns 404/410 so they are hidden from the list
  let markGone: { checked: number; marked: number; errors: number } | { error: string } = {
    error: "not run",
  };
  try {
    markGone = await markGoneSourceUrls();
    console.log("[cron/ingest] Mark gone source URLs:", markGone);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/ingest] Mark gone source URLs failed:", message);
    markGone = { error: message };
  }

  const endTime = new Date().toISOString();
  console.log(`[cron/ingest] Finished ingestion at ${endTime}`);

  return NextResponse.json({
    instagram,
    slack,
    meetup,
    markGoneSourceUrls: markGone,
    timestamp: { start: startTime, end: endTime },
  });
}
