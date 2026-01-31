# Project State: EventosGC

## Current Status

**Project Phase:** Phase 03 — Instagram Ingestion (completed)
**Last Updated:** 2026-01-31
**Next Step:** Execute Phase 04 (Slack Ingestion)

## Completed Phases

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
- Vitest test suite (17 tests)
- GSD and Ralphy tooling installed

## Decisions

- **Sources (v1):** Instagram (via RapidAPI) + Slack (specific workspace)
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
- Required env vars for ingestion: RAPIDAPI_KEY, ANTHROPIC_API_KEY, INSTAGRAM_ACCOUNTS
- Slack: existing community workspace, public channel, freeform text messages
- Slack bot needs: channels:history + channels:read scopes
- Will need bot token and channel ID when executing Phase 04
