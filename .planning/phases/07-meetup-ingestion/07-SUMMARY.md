# Phase 07: Meetup Integration — SUMMARY

## Goal

Add Meetup.com as a third event source so the app automatically discovers and ingests community events from the Meetup platform for the Gran Canaria area.

## Completed Work

### Plan 01: OAuth2 Auth
- **`src/lib/meetup/auth.ts`** — OAuth2 helpers: `exchangeCodeForTokens`, `refreshAccessToken`, `getAccessToken`, `clearAccessTokenCache`
- **`src/lib/meetup/__tests__/auth.test.ts`** — 8 tests for token exchange, refresh, getAccessToken, cache clear

### Plan 02–03: GraphQL Client & Data Transformation
- **`src/lib/ingestion/meetup.ts`** — Meetup GraphQL client and transformation:
  - `fetchMeetupEvents()` with Gran Canaria lat/lon (27.9202, -15.5474), radius 50km, first 50
  - OAuth2 Bearer token via `getAccessToken()`, 401 triggers token cache clear
  - Retry with exponential backoff on 429
  - `transformMeetupEvent()` → RawEvent: keyword-based category mapping, date/time in Atlantic/Canary, location from venue or "Online", image from featuredEventPhoto
- **`src/lib/ingestion/types.ts`** — Added `"meetup"` to RawEvent source type
- **`src/lib/ingestion/__tests__/meetup.test.ts`** — 9 tests for transform and fetcher (mocked API)

### Plan 04: Pipeline
- **`src/lib/ingestion/meetup-pipeline.ts`** — `ingestFromMeetup()`: fetch → transform → upsert (onConflict: source_url), standalone script support
- **`src/lib/ingestion/__tests__/meetup-pipeline.test.ts`** — 7 tests for pipeline (mocked meetup + Supabase)

### Plan 05: Cron Integration
- **`supabase/migrations/004_add_meetup_source.sql`** — Allow `source = 'meetup'` in events CHECK constraint
- **`src/app/api/cron/ingest/route.ts`** — Run Meetup pipeline when `MEETUP_CLIENT_ID` and `MEETUP_REFRESH_TOKEN` are set; skip with error message otherwise; response includes `meetup`
- **`src/app/api/cron/ingest/__tests__/route.test.ts`** — Mock Statsig; added tests for three pipelines, Meetup skip when no creds, Meetup failure isolation
- **README.md** — Meetup env vars and standalone run

### Plan 06: Documentation
- **`.env.example`** — MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN
- **`.planning/STATE.md`** — Phase 07 complete, Meetup in What Exists and Decisions
- **`.planning/PROJECT.md`** — Already mentioned Meetup in vision/solution (no change needed)

## Verification

- [x] Events from Meetup can be stored with source="meetup", source_url=eventUrl
- [x] Cron runs Meetup when creds set; skips with message when not set
- [x] Meetup events deduplicated by source_url (upsert onConflict)
- [x] Gran Canaria filtering via lat/lon 27.9202, -15.5474, radius 50km
- [x] OAuth2 token refresh via getAccessToken(); 401 clears cache
- [x] Rate limit 429 handled with exponential backoff (3 retries)
- [x] Keyword category mapping (music, arts, food, sports, festival, theater, workshop, market)
- [x] Tests: auth 8, meetup 9, meetup-pipeline 7, cron route 9 (Statsig mocked)

## Files Touched

| File | Change |
|------|--------|
| `src/lib/meetup/auth.ts` | New |
| `src/lib/meetup/__tests__/auth.test.ts` | New |
| `src/lib/ingestion/meetup.ts` | New |
| `src/lib/ingestion/__tests__/meetup.test.ts` | New |
| `src/lib/ingestion/meetup-pipeline.ts` | New |
| `src/lib/ingestion/__tests__/meetup-pipeline.test.ts` | New |
| `src/lib/ingestion/types.ts` | Add "meetup" to source |
| `supabase/migrations/004_add_meetup_source.sql` | New |
| `src/app/api/cron/ingest/route.ts` | Meetup block + response |
| `src/app/api/cron/ingest/__tests__/route.test.ts` | Statsig mock + Meetup tests |
| `README.md` | Meetup section |
| `.env.example` | Meetup vars |
| `.planning/STATE.md` | Phase 07 + Meetup |
| `.planning/phases/07-meetup-ingestion/07-SUMMARY.md` | This file |

## Required Env Vars (Meetup)

- `MEETUP_CLIENT_ID` — OAuth client ID (Meetup API OAuth app)
- `MEETUP_CLIENT_SECRET` — OAuth client secret
- `MEETUP_REFRESH_TOKEN` — Long-lived refresh token (one-time OAuth2 code exchange)

## Standalone Run

```bash
npx tsx src/lib/ingestion/meetup-pipeline.ts
```

Requires `.env.local` with Meetup + Supabase vars.

## Notes

- Category mapping is keyword-based; AI parser fallback can be added later if needed.
- Meetup API does not expose ticket price; `ticket_price` is null for Meetup events.
- Bilingual fields: title_en/title_es and description_en/description_es are set from Meetup title/description (no translation in v1); source_language = "unknown".
