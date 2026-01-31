# Project State: EventosGC

## Current Status

**Project Phase:** Phase 01 — Supabase Schema & Client Setup
**Last Updated:** 2026-01-31
**Next Step:** `/gsd:plan-phase 1` to create detailed execution plans

## Completed Phases

_None yet._

## What Exists

- Next.js 16 app with Tailwind CSS
- UI components: Header, Hero, EventCard, EventSection, Footer, CategoryLabel
- Hardcoded event data in page.tsx (9 sample events across 3 sections)
- Supabase packages installed (@supabase/supabase-js, @supabase/ssr)
- RapidAPI MCP configured for Instagram (instagram120)
- GSD and Ralphy tooling installed

## Decisions

- **Sources (v1):** Instagram (via RapidAPI) + Slack (specific workspace)
- **Backend:** Supabase for event storage and API only (no auth)
- **User model:** Aggregator only — no user submissions, no accounts
- **Categories:** music, arts, food, sports, festival, theater, workshop, market
- **Supabase:** New project to be created in Phase 01
- **Instagram targets:** Specific event promoter accounts (to be provided)
- **Event parsing:** AI-assisted (LLM) to extract structured data from captions/messages

## Notes

- Existing UI is static/hardcoded — needs to be wired to Supabase
- Instagram integration uses RapidAPI instagram120 endpoint (key already configured in .mcp.json)
- Slack workspace TBD — will need bot token or webhook URL
- Will need Claude API key (or similar) for AI-assisted event parsing in Phases 03/04
