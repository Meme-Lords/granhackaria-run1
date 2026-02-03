import { NextResponse } from "next/server";
import { markGoneSourceUrls } from "@/lib/mark-gone-source-urls";

// Trigger via cron-job.org every 10 min to hide events whose source_url returns 404/410.
export const maxDuration = 30;

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = new Date().toISOString();
  console.log("[cron/mark-gone] Starting at", startTime);

  try {
    const result = await markGoneSourceUrls();
    console.log("[cron/mark-gone] Result:", result);
    const endTime = new Date().toISOString();
    return NextResponse.json({
      ...result,
      timestamp: { start: startTime, end: endTime },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[cron/mark-gone] Failed:", message);
    const endTime = new Date().toISOString();
    return NextResponse.json(
      { error: message, timestamp: { start: startTime, end: endTime } },
      { status: 500 }
    );
  }
}
