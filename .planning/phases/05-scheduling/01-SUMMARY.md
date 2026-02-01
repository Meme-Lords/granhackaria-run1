# Phase 05: Scheduling — Summary

## What Was Done

### Task 1: Cron API Route for Ingestion
- Created `src/app/api/cron/ingest/route.ts` with GET handler
- Authorization via `Bearer` token checked against `CRON_SECRET` env var
- Runs Instagram ingestion pipeline (reads `INSTAGRAM_ACCOUNTS` env var)
- Runs Slack ingestion pipeline independently
- Each pipeline wrapped in try/catch — one failure does not block the other
- Returns JSON with `{ instagram, slack, timestamp: { start, end } }`
- `maxDuration` set to 60 seconds for Vercel serverless timeout
- Added `CRON_SECRET` to `.env.example`

### Task 2: Vercel Cron Schedule
- Created `vercel.json` with cron config: `*/15 * * * *` (every 15 minutes)
- Path points to `/api/cron/ingest`
- Note: Hobby plan limits cron to once daily; Pro plan supports custom schedules

## Tests Added
- 7 tests in `src/app/api/cron/ingest/__tests__/route.test.ts`:
  - Returns 401 when CRON_SECRET is set and auth header missing
  - Returns 401 when CRON_SECRET is set and auth header wrong
  - Runs both pipelines when authorized
  - Allows access when CRON_SECRET is not set
  - Instagram failure does not block Slack
  - Slack failure does not block Instagram
  - Reports missing INSTAGRAM_ACCOUNTS config

## Artifacts
- `src/app/api/cron/ingest/route.ts`
- `src/app/api/cron/ingest/__tests__/route.test.ts`
- `vercel.json`
- `.env.example` (updated with CRON_SECRET)

## Test Results
- 37 tests passing (6 test files), 0 failures
- TypeScript compiles with no errors

## Decisions
- Single cron endpoint triggers both pipelines sequentially (simpler than separate routes)
- Auth is optional — if CRON_SECRET is not set, route is open (for local dev)
- Missing INSTAGRAM_ACCOUNTS is a soft error (reported in JSON, not a crash)
