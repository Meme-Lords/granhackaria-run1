# Project State: EventosGC

## Current Status

**Project Phase:** Phase 07 — Meetup Ingestion (completed)
**Last Updated:** 2026-02-01
**Next Step:** Apply migration 004 if not yet applied, then Phase 08/09+

## Completed Phases

### Phase 07: Meetup Ingestion
- Meetup OAuth2 helpers (`src/lib/meetup/auth.ts`) and token refresh
- Meetup GraphQL fetcher and transform (`src/lib/ingestion/meetup.ts`) for Gran Canaria (lat/lon, 50km)
- Meetup pipeline (`src/lib/ingestion/meetup-pipeline.ts`) with upsert by source_url
- Cron route runs Meetup when MEETUP_CLIENT_ID + MEETUP_REFRESH_TOKEN set; skips otherwise
- Migration 004: events source CHECK includes 'meetup'
- 24 new tests (auth, meetup, meetup-pipeline, cron)
- See `.planning/phases/07-meetup-ingestion/07-SUMMARY.md`

### Phase 08: Bilingual Event Content
- Added bilingual columns (title_en, title_es, description_en, description_es, source_language) to events table
- Updated AI parser to extract both English and Spanish in a single API call
- Updated Instagram and Slack pipelines to store bilingual fields
- Made query layer locale-aware with fallback to legacy columns
- Server-side locale from cookies, synced from I18nProvider
- Created batch migration script for existing events
- Added LocaleMetadata component for html lang and document title
- 83 tests passing (added locale selection, fallback, and Spanish date tests)
- See `.planning/phases/08-bilingual-events/08-SUMMARY.md`

### Phase 05: Scheduling
- Created cron API route at `/api/cron/ingest` with CRON_SECRET authorization
- Runs both Instagram and Slack pipelines independently (failure isolation)
- Returns JSON with combined results and timestamps
- Configured Vercel cron in `vercel.json` (every 15 minutes)
- Added 7 tests for the cron route (37 total)
- See `.planning/phases/05-scheduling/01-SUMMARY.md`

### Phase 04: Slack Ingestion
- Created Slack fetcher via @slack/web-api (`src/lib/ingestion/slack.ts`)
- Created Slack ingestion pipeline (`src/lib/ingestion/slack-pipeline.ts`)
- Reuses shared AI parser from Phase 03
- Supports incremental fetching with `since` parameter
- Added 13 tests for fetcher and pipeline (30 total)
- See `.planning/phases/04-slack-ingestion/01-SUMMARY.md`

### Phase 03: Instagram Ingestion
- Created ingestion types (`RawInstagramPost`, `RawEvent`)
- Created Instagram fetcher via RapidAPI (`src/lib/ingestion/instagram.ts`)
- Created AI-assisted event parser using Anthropic SDK (`src/lib/ingestion/parser.ts`)
- Created end-to-end ingestion pipeline (`src/lib/ingestion/instagram-pipeline.ts`)
- Added vitest with 17 tests covering fetcher, parser, and pipeline
- See `.planning/phases/03-instagram-ingestion/02-SUMMARY.md`

### Phase 02: Wire Frontend to Supabase
- Replaced hardcoded event data with live Supabase queries
- Created Supabase server client (`src/lib/supabase/server.ts`)
- Created event query functions (`src/lib/queries/events.ts`)
- Converted page.tsx to async server component
- Added empty state handling in EventSection
- See `.planning/phases/02-wire-frontend/02-SUMMARY.md`

### Phase 01, Plan 02: Events Schema & Seed Data
- Events table migration created (`supabase/migrations/001_create_events.sql`)
- Seed script created (`src/lib/supabase/seed.ts`) with 9 sample events
- RLS enabled with anonymous read access
- See `.planning/phases/01-supabase-setup/02-SUMMARY.md`

## What Exists

- Next.js 16 app with Tailwind CSS
- UI components: Header, Hero, EventCard, EventSection, Footer, CategoryLabel
- Homepage fetches events from Supabase (server component with parallel queries)
- Empty state handling for sections with no events (bilingual)
- Supabase server client using @supabase/ssr
- Event query functions: getTodayEvents, getTomorrowEvents, getThisWeekEvents
- Events table migration applied
- Seed data in Supabase (9 sample events)
- Instagram ingestion pipeline (fetch -> AI parse -> Supabase upsert)
- AI-assisted event parser using Claude API (Anthropic SDK)
- Instagram fetcher via RapidAPI instagram120 endpoint
- Slack ingestion pipeline (fetch -> AI parse -> Supabase upsert)
- Slack fetcher via @slack/web-api with incremental fetch support
- Meetup ingestion pipeline (fetch -> transform -> Supabase upsert)
- Meetup OAuth2 auth and GraphQL fetcher for Gran Canaria events
- Cron API route for automated ingestion (`/api/cron/ingest`) — Instagram, Slack, Meetup
- Vercel cron configuration (every 15 minutes)
- Bilingual event content (title_en/title_es, description_en/description_es)
- Locale-aware queries (pass locale, select bilingual columns with fallback)
- Server-side locale detection via cookies
- LocaleMetadata component (html lang, document title, meta description)
- Batch migration script for existing events (`scripts/migrate-events-bilingual.ts`)
- Vitest test suite (109 tests; Phase 07 added Meetup auth, fetcher, pipeline, cron tests)
- GSD and Ralphy tooling installed

## Decisions

- **Sources (v1):** Instagram (via RapidAPI) + Slack (specific workspace) + Meetup (GraphQL API)
- **Backend:** Supabase for event storage and API only (no auth)
- **User model:** Aggregator only — no user submissions, no accounts
- **Categories:** music, arts, food, sports, festival, theater, workshop, market
- **App name:** EventosGC (public-facing)
- **Language:** Bilingual — parse and display both Spanish and English events as-is
- **Supabase:** New project to be created in Phase 01
- **Instagram targets:** Specific event promoter accounts (to be provided)
- **Event parsing:** AI-assisted using Claude Sonnet for structured extraction
- **Instagram fetch size:** 10 most recent posts per account per run
- **Hosting:** Vercel (Hobby plan — cron runs once daily)
- **Ingestion frequency:** Once daily (Hobby plan limitation)

## Notes

- Homepage is now data-driven — events flow from Supabase to the UI
- Instagram ingestion pipeline is runnable as: `npx tsx src/lib/ingestion/instagram-pipeline.ts`
- Required env vars for Instagram ingestion: RAPIDAPI_KEY, ANTHROPIC_API_KEY, INSTAGRAM_ACCOUNTS
- Slack ingestion pipeline is runnable as: `npx tsx src/lib/ingestion/slack-pipeline.ts`
- Required env vars for Slack ingestion: SLACK_BOT_TOKEN, SLACK_CHANNEL_ID, ANTHROPIC_API_KEY
- Meetup ingestion pipeline runnable as: `npx tsx src/lib/ingestion/meetup-pipeline.ts`
- Required env vars for Meetup ingestion: MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN
- Slack bot needs: channels:history + channels:read scopes
