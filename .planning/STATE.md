# Project State: EventosGC

## Current Status

**Project Phase:** Phase 02 — Wire Frontend to Supabase (completed)
**Last Updated:** 2026-01-31
**Next Step:** Execute Phase 03 (Instagram Ingestion)

## Completed Phases

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
- RapidAPI MCP configured for Instagram (instagram120)
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
- **Event parsing:** AI-assisted using Claude Haiku (cheapest/fastest) for structured extraction
- **Instagram fetch size:** 10 most recent posts per account per run
- **Hosting:** Vercel (Hobby plan — cron runs once daily)
- **Ingestion frequency:** Once daily (Hobby plan limitation)

## Notes

- Homepage is now data-driven — events flow from Supabase to the UI
- Instagram integration uses RapidAPI instagram120 endpoint (key already configured in .mcp.json)
- Slack: existing community workspace, public channel, freeform text messages
- Slack bot needs: channels:history + channels:read scopes
- Will need bot token and channel ID when executing Phase 04
- Will need Claude API key (or similar) for AI-assisted event parsing in Phases 03/04
