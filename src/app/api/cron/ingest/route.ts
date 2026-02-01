import { NextResponse } from "next/server";
import { ingestFromInstagram } from "@/lib/ingestion/instagram-pipeline";
import { ingestFromSlack } from "@/lib/ingestion/slack-pipeline";

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

  // Run Instagram ingestion
  try {
    const accountsEnv = process.env.INSTAGRAM_ACCOUNTS;
    if (accountsEnv) {
      const accounts = accountsEnv
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      instagram = await ingestFromInstagram(accounts);
      console.log("[cron/ingest] Instagram result:", instagram);
    } else {
      instagram = { error: "INSTAGRAM_ACCOUNTS not configured" };
      console.log("[cron/ingest] Skipping Instagram: INSTAGRAM_ACCOUNTS not set");
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

  const endTime = new Date().toISOString();
  console.log(`[cron/ingest] Finished ingestion at ${endTime}`);

  return NextResponse.json({
    instagram,
    slack,
    timestamp: { start: startTime, end: endTime },
  });
}
