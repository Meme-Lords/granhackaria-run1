# Phase 08: Bilingual Event Content — SUMMARY

## What Was Done

Phase 08 adds fully bilingual event titles and descriptions, so events display in the user's selected language (English or Spanish) when they toggle the language selector.

### Plans Completed

1. **Database Schema Migration** — Added `title_en`, `title_es`, `description_en`, `description_es`, and `source_language` columns to the `events` table. Legacy `title`/`description` columns kept as fallback.

2. **Bilingual Parser** — Updated AI system prompts (text + vision) to extract both English and Spanish titles/descriptions in a single API call. The parser detects source language and translates to the other.

3. **Updated Types** — Added bilingual fields to `RawEvent` interface: `title_en`, `title_es`, `description_en`, `description_es`, `source_language`.

4. **Updated Pipelines** — Both Instagram and Slack pipelines now store bilingual fields on insert/upsert. Vision merge also carries bilingual data.

5. **Locale-Aware Queries** — `getTodayEvents`, `getTomorrowEvents`, `getThisWeekEvents` accept a `locale` parameter. Selects from `title_en`/`title_es` columns with fallback to legacy `title` for unmigrated rows. Date formatting uses `en-US` or `es-ES` locale.

6. **Server-Side Locale** — Created `getLocaleFromCookies()` helper using `next/headers`. Updated `I18nProvider` to sync locale to a cookie. `page.tsx` reads the cookie and passes locale to queries.

7. **Migration Script** — Created `scripts/migrate-events-bilingual.ts` to batch-translate existing events using Claude Haiku. Processes 10 at a time, supports `--dry-run`.

8. **Locale Metadata** — Created `LocaleMetadata` component that updates `<html lang>`, `<title>`, and `<meta description>` when the user switches language.

9. **Tests** — Updated all tests for bilingual data: parser (14 tests), Instagram pipeline (9 tests), Slack pipeline (7 tests), events queries (9 tests including locale selection, fallback, and Spanish date formatting). 83 tests passing total.

10. **Cleanup** — Deferred (Plan 10). Legacy columns kept for 30+ day safety period.

### Files Changed

| File | Change |
|------|--------|
| `supabase/migrations/003_add_bilingual_columns.sql` | New migration |
| `src/lib/ingestion/types.ts` | Added bilingual fields to RawEvent |
| `src/lib/ingestion/parser.ts` | Bilingual prompts + response handling |
| `src/lib/ingestion/instagram-pipeline.ts` | Store bilingual fields on insert |
| `src/lib/ingestion/slack-pipeline.ts` | Store bilingual fields on upsert |
| `src/lib/queries/events.ts` | Locale-aware query + date formatting |
| `src/lib/i18n/server.ts` | New: server-side locale from cookies |
| `src/lib/i18n/context.tsx` | Sync locale to cookie |
| `src/app/page.tsx` | Read locale, pass to queries |
| `src/components/LocaleMetadata.tsx` | New: locale-aware metadata |
| `src/app/layout.tsx` | Mount LocaleMetadata |
| `scripts/migrate-events-bilingual.ts` | New: batch translation script |
| `src/lib/ingestion/__tests__/parser.test.ts` | Updated for bilingual |
| `src/lib/ingestion/__tests__/instagram-pipeline.test.ts` | Updated for bilingual |
| `src/lib/ingestion/__tests__/slack-pipeline.test.ts` | Updated for bilingual |
| `src/lib/queries/__tests__/events.test.ts` | Updated for locale param |

### Test Results

- **83 tests passing** (80 bilingual-related + 3 unrelated passing)
- **3 pre-existing failures** in cron route test (Statsig mock issue, unrelated)
- TypeScript compiles cleanly
- ESLint: no new warnings or errors

### Next Steps

- Run the migration script against production/staging: `npx tsx scripts/migrate-events-bilingual.ts`
- Apply the database migration: `003_add_bilingual_columns.sql`
- After 30+ days of bilingual data, consider Plan 10 (drop legacy columns)
- If Phase 07 (Meetup) ships, update its pipeline to include bilingual fields
