# Phase 03 — Instagram Ingestion: Summary

## What Was Done

### Plan 01: Instagram Fetcher & Types (prerequisite)
- Created `src/lib/ingestion/types.ts` with `RawInstagramPost` and `RawEvent` interfaces
- Created `src/lib/ingestion/instagram.ts` with `fetchAccountPosts()` using RapidAPI instagram120 endpoint
- Added `RAPIDAPI_KEY` to `.env.example`

### Plan 02 Task 1: AI-Assisted Event Parser
- Created `src/lib/ingestion/parser.ts` with `parseEventFromText()` using Anthropic SDK
- Uses Claude to extract structured event data (title, date, time, location, category) from freeform captions
- Non-event posts return `null` (filtered out)
- Invalid categories default to "festival"
- Added `ANTHROPIC_API_KEY` to `.env.example`

### Plan 02 Task 2: Instagram Ingestion Pipeline
- Created `src/lib/ingestion/instagram-pipeline.ts` with `ingestFromInstagram()` function
- End-to-end pipeline: fetch posts -> parse with AI -> upsert into Supabase
- Deduplication via `source_url` unique index (`ON CONFLICT DO NOTHING`)
- Runnable as standalone script: `npx tsx src/lib/ingestion/instagram-pipeline.ts`
- Added `INSTAGRAM_ACCOUNTS` to `.env.example`

### Testing
- Installed vitest and added `test` script to package.json
- 17 tests across 3 test files:
  - `instagram.test.ts` (6 tests): fetcher API calls, error handling, count limits
  - `parser.test.ts` (7 tests): event parsing, non-event filtering, error handling
  - `instagram-pipeline.test.ts` (4 tests): multi-account processing, skip logic, error counting

## Files Created/Modified
- `src/lib/ingestion/types.ts` (new)
- `src/lib/ingestion/instagram.ts` (new)
- `src/lib/ingestion/parser.ts` (new)
- `src/lib/ingestion/instagram-pipeline.ts` (new)
- `src/lib/ingestion/__tests__/instagram.test.ts` (new)
- `src/lib/ingestion/__tests__/parser.test.ts` (new)
- `src/lib/ingestion/__tests__/instagram-pipeline.test.ts` (new)
- `.env.example` (updated)
- `package.json` (updated — added @anthropic-ai/sdk, vitest, test script)

## Verification
- TypeScript compiles (`npx tsc --noEmit` passes)
- All 17 tests pass (`npx vitest run`)
- Pipeline is runnable as a script with env vars configured

## Required Environment Variables
To run the pipeline, set these in `.env.local`:
- `RAPIDAPI_KEY` — RapidAPI key for Instagram scraping
- `ANTHROPIC_API_KEY` — Anthropic API key for AI parsing
- `INSTAGRAM_ACCOUNTS` — comma-separated Instagram usernames
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY` — Supabase auth key
