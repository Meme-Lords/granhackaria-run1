# Phase 08: Bilingual Event Content — PLAN

## Goal

Enable fully bilingual event titles and descriptions that switch seamlessly between English and Spanish when users toggle the language, matching the existing bilingual UI.

## Success Criteria (Goal-Backward)

**What must be TRUE:**
1. Event titles and descriptions display in English when locale = "en"
2. Event titles and descriptions display in Spanish when locale = "es"
3. Date formatting uses correct locale ("Mon, Jan 6" vs "lun, 6 ene")
4. All three event sources (Instagram, Slack, Meetup) store bilingual content
5. Language switching is instant (no runtime translation delays)
6. Existing events are migrated with both languages populated
7. Parser AI extracts or translates to both languages in one call (cost-efficient)
8. Database schema supports bilingual columns with appropriate indexes
9. Test coverage matches existing patterns (>90%)
10. Fallback logic handles missing translations gracefully

## Context

**What exists:**
- **Bilingual UI**: `src/lib/i18n` with `Locale = "en" | "es"`, `useI18n()` hook, complete `translations.ts` (all static UI text in both languages)
- **Language toggle**: Working navbar toggle that switches all UI text
- **Category labels**: Already bilingual via `t.categories[category]`
- **Three event sources**: Instagram, Slack pipelines working (Meetup planned in Phase 07)
- **AI parser**: `parseEventFromText()` using Anthropic Claude for event extraction

**What's missing:**
- Event `title` and `description` are single-language (whatever the source posted)
- Queries don't accept or use `locale` parameter
- Date formatting hardcoded to `"en-US"`
- Database schema has single `title`/`description` columns
- No translation or bilingual extraction in ingestion pipelines

**Current DB Schema:**
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE NOT NULL,
  date_end DATE,
  time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL CHECK (source IN ('instagram', 'slack', 'manual')),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**i18n Architecture:**
- Client-side language state via `I18nProvider` context
- `useI18n()` hook returns `{ locale, setLocale, t }`
- Language stored in localStorage, persisted across sessions
- All static UI uses `t.*` for translations

## Research Questions

✅ **Already answered:**
1. **Storage approach**: Store both languages (recommended over runtime translation)
2. **Translation method**: AI during ingestion (Claude can output both in one call)
3. **Schema changes**: Add `title_en`, `title_es`, `description_en`, `description_es`, `source_language`
4. **Query layer**: Pass locale to queries, select appropriate columns
5. **Migration strategy**: Detect language and translate existing events

## Plans

### Plan 01: Database Schema Migration

**Goal:** Add bilingual columns to events table and create migration for existing data.

**Tasks:**
1. Create migration file `002_add_bilingual_columns.sql`:
   ```sql
   ALTER TABLE events ADD COLUMN title_en TEXT;
   ALTER TABLE events ADD COLUMN title_es TEXT;
   ALTER TABLE events ADD COLUMN description_en TEXT;
   ALTER TABLE events ADD COLUMN description_es TEXT;
   ALTER TABLE events ADD COLUMN source_language VARCHAR(2) CHECK (source_language IN ('en', 'es', 'unknown'));
   ```
2. Keep existing `title` and `description` as fallback columns (migrate away later)
3. Add indexes for common queries (if needed)
4. Update RLS policies (should inherit from table)
5. Test migration locally with Supabase CLI
6. Document rollback plan (drop columns if needed)

**Verification:**
- [ ] Migration runs successfully without errors
- [ ] New columns visible in Supabase dashboard
- [ ] Existing data preserved in original columns
- [ ] Can insert events with bilingual fields

**Files:**
- `supabase/migrations/002_add_bilingual_columns.sql` — Migration script
- `.planning/phases/08-bilingual-events/migration-rollback.md` — Rollback instructions

---

### Plan 02: Update Parser for Bilingual Extraction

**Goal:** Modify AI parser to extract or translate event data into both English and Spanish.

**Tasks:**
1. Update `parseEventFromText()` to return bilingual fields:
   ```typescript
   interface ParsedEventBilingual {
     title_en: string;
     title_es: string;
     description_en: string | null;
     description_es: string | null;
     source_language: 'en' | 'es' | 'unknown';
     // ... existing fields
   }
   ```
2. Update Claude prompt to:
   - Detect source language (en/es)
   - If source is Spanish: keep original as `_es`, translate to `_en`
   - If source is English: keep original as `_en`, translate to `_es`
   - If ambiguous/mixed: best effort translation for both
   - Return both versions in single API call (cost-efficient)
3. Update `parseEventFromImage()` similarly for vision parsing
4. Add language detection logic (simple keyword check or rely on AI)
5. Test with sample Spanish and English event posts
6. Handle edge cases:
   - Very short titles (e.g., "Jazz Night") → translate anyway
   - Already bilingual posts (e.g., "Salsa Night / Noche de Salsa") → extract both
   - Missing description → null for both languages

**Verification:**
- [ ] Parser returns both `title_en` and `title_es`
- [ ] Parser returns both `description_en` and `description_es`
- [ ] Source language detected correctly (sample events)
- [ ] Translations are accurate and natural (manual review)
- [ ] Single API call (not two separate calls)

**Files:**
- `src/lib/ingestion/parser.ts` — Update parser logic
- `src/lib/ingestion/__tests__/parser.test.ts` — Update tests with bilingual expectations

**Example Prompt Update:**
```typescript
const prompt = `
Extract event information from the following text and provide a bilingual response.

1. Detect the source language (en for English, es for Spanish, or unknown if mixed/unclear)
2. Extract all event details (title, date, location, category, etc.)
3. Provide BOTH English and Spanish versions:
   - If source is Spanish: title_es = original, title_es → translate to title_en
   - If source is English: title_en = original, title_en → translate to title_es
   - Same for description
4. Ensure translations are natural and culturally appropriate

Text: ${text}

Return JSON:
{
  "title_en": "English title",
  "title_es": "Spanish title",
  "description_en": "English description or null",
  "description_es": "Spanish description or null",
  "source_language": "en" | "es" | "unknown",
  "date_start": "YYYY-MM-DD",
  ...
}
`;
```

---

### Plan 03: Update Event Types and Interfaces

**Goal:** Update TypeScript types to support bilingual fields throughout the codebase.

**Tasks:**
1. Update `RawEvent` interface in `src/lib/ingestion/types.ts`:
   ```typescript
   export interface RawEvent {
     title_en: string;
     title_es: string;
     description_en: string | null;
     description_es: string | null;
     source_language: 'en' | 'es' | 'unknown';
     date_start: string;
     time: string | null;
     location: string;
     ticket_price: string | null;
     category: "music" | "arts" | "food" | "sports" | "festival" | "theater" | "workshop" | "market";
     image_url: string | null;
     source: "instagram" | "slack" | "meetup" | "manual";
     source_url: string | null;
   }
   ```
2. Update `EventRow` interface in `src/lib/queries/events.ts`:
   ```typescript
   interface EventRow {
     id: string;
     title_en: string | null;
     title_es: string | null;
     description_en: string | null;
     description_es: string | null;
     title: string; // Fallback (temporary during migration)
     description: string | null; // Fallback (temporary)
     source_language: string | null;
     date_start: string;
     // ... rest
   }
   ```
3. Update database insert types (if using generated Supabase types, regenerate)
4. Ensure backward compatibility during migration (keep old fields temporarily)

**Verification:**
- [ ] TypeScript compiles without errors
- [ ] Types reflect new bilingual schema
- [ ] Existing code still works with fallback fields

**Files:**
- `src/lib/ingestion/types.ts` — Update RawEvent interface
- `src/lib/queries/events.ts` — Update EventRow interface

---

### Plan 04: Update Ingestion Pipelines

**Goal:** Modify all three pipelines to store bilingual event data.

**Tasks:**
1. **Instagram Pipeline** (`instagram-pipeline.ts`):
   - Update `parseEventFromText()` call to use new bilingual output
   - Update `parseEventFromImage()` call similarly
   - Update `upsertEvent()` to insert bilingual fields
   - Keep `title`/`description` as fallback (copy from `_en` or `_es` based on source_language)

2. **Slack Pipeline** (`slack-pipeline.ts`):
   - Update `parseEventFromText()` call
   - Update `upsertEvent()` to insert bilingual fields

3. **Meetup Pipeline** (if Phase 07 already executed):
   - If Meetup pipeline exists: update it
   - If not yet executed: ensure Phase 07 plan includes bilingual support from start

4. Update shared `upsertEvent()` function to handle bilingual fields:
   ```typescript
   await supabase.from("events").insert({
     title: event.source_language === 'es' ? event.title_es : event.title_en, // Fallback
     description: event.source_language === 'es' ? event.description_es : event.description_en,
     title_en: event.title_en,
     title_es: event.title_es,
     description_en: event.description_en,
     description_es: event.description_es,
     source_language: event.source_language,
     // ... other fields
   });
   ```

5. Test each pipeline independently (run standalone scripts)
6. Verify bilingual fields populated in Supabase after ingestion

**Verification:**
- [ ] Instagram pipeline stores bilingual events
- [ ] Slack pipeline stores bilingual events
- [ ] Meetup pipeline stores bilingual events (if exists)
- [ ] New events have `title_en`, `title_es`, `description_en`, `description_es` populated
- [ ] `source_language` set correctly
- [ ] Tests pass for all pipelines

**Files:**
- `src/lib/ingestion/instagram-pipeline.ts` — Update pipeline
- `src/lib/ingestion/slack-pipeline.ts` — Update pipeline
- `src/lib/ingestion/meetup-pipeline.ts` — Update pipeline (if exists)
- `src/lib/ingestion/__tests__/*.test.ts` — Update tests

---

### Plan 05: Update Query Layer for Locale-Aware Fetching

**Goal:** Pass locale to query functions and return localized event data.

**Tasks:**
1. Update query function signatures to accept `locale`:
   ```typescript
   export async function getTodayEvents(locale: Locale): Promise<EventCardProps[]>
   export async function getTomorrowEvents(locale: Locale): Promise<EventCardProps[]>
   export async function getThisWeekEvents(locale: Locale): Promise<EventCardProps[]>
   ```

2. Select bilingual columns in queries:
   ```typescript
   const { data, error } = await supabase
     .from("events")
     .select("id, title_en, title_es, description_en, description_es, title, description, source_language, date_start, time, location, category, image_url, source_url, created_at")
     .eq("date_start", today)
     .order("time", { ascending: true });
   ```

3. Update `toEventCardProps()` to select by locale:
   ```typescript
   function toEventCardProps(row: EventRow, showClock: boolean, locale: Locale): EventCardProps {
     const title = locale === 'es'
       ? (row.title_es ?? row.title)  // Fallback to old field if missing
       : (row.title_en ?? row.title);

     const description = locale === 'es'
       ? (row.description_es ?? row.description)
       : (row.description_en ?? row.description);

     return {
       imageUrl: row.image_url ?? "https://images.unsplash.com/photo-1516275992531-b5e19d647811?w=1080",
       category: row.category as CategoryVariant,
       time: showClock && row.time ? row.time : formatWeekdayDate(row.date_start, locale),
       title,
       description,
       location: row.location,
       showClock,
       sourceUrl: row.source_url,
     };
   }
   ```

4. Update `formatWeekdayDate()` to use locale:
   ```typescript
   function formatWeekdayDate(dateStr: string, locale: Locale): string {
     const date = new Date(dateStr + "T00:00:00");
     return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
       weekday: "short",
       month: "short",
       day: "numeric",
     });
   }
   ```

5. Add tests for locale selection logic

**Verification:**
- [ ] Queries accept locale parameter
- [ ] English locale returns `title_en` and `description_en`
- [ ] Spanish locale returns `title_es` and `description_es`
- [ ] Date formatting uses correct locale
- [ ] Fallback works for events with missing translations
- [ ] Tests pass

**Files:**
- `src/lib/queries/events.ts` — Update query functions
- `src/lib/queries/__tests__/events.test.ts` — Update tests

---

### Plan 06: Update Page Components to Pass Locale

**Goal:** Connect page components to i18n system and pass locale to queries.

**Tasks:**
1. Update `app/page.tsx` to get locale and pass to queries:
   ```typescript
   import { useI18n } from "@/lib/i18n";

   export default async function HomePage() {
     // Note: Server components can't use useI18n() directly
     // Options:
     // A) Make this a client component (wrap in 'use client')
     // B) Read locale from cookies/headers server-side
     // C) Fetch both languages and select client-side

     // Recommended: Option B (server-side)
     const locale = getLocaleFromRequest(); // New helper

     const [todayEvents, tomorrowEvents, thisWeekEvents] = await Promise.all([
       getTodayEvents(locale),
       getTomorrowEvents(locale),
       getThisWeekEvents(locale),
     ]);

     // ... rest
   }
   ```

2. Create `getLocaleFromRequest()` helper:
   ```typescript
   // src/lib/i18n/server.ts
   import { cookies } from 'next/headers';
   import type { Locale } from './translations';

   export function getLocaleFromRequest(): Locale {
     const cookieStore = cookies();
     const localeCookie = cookieStore.get('locale');
     return (localeCookie?.value === 'es' ? 'es' : 'en') as Locale;
   }
   ```

3. Ensure `I18nProvider` sets locale cookie when changed (client-side):
   ```typescript
   const setLocale = (newLocale: Locale) => {
     setCurrentLocale(newLocale);
     localStorage.setItem('locale', newLocale);
     document.cookie = `locale=${newLocale}; path=/; max-age=31536000`; // 1 year
   };
   ```

4. Test language switching end-to-end:
   - Toggle language in navbar
   - Verify cookie set
   - Refresh page
   - Verify events display in new language

**Verification:**
- [ ] Page reads locale from cookie/localStorage
- [ ] Events display in correct language on initial load
- [ ] Language toggle switches event titles/descriptions
- [ ] Date formatting updates with language
- [ ] No hydration errors (SSR matches CSR)

**Files:**
- `src/app/page.tsx` — Update to pass locale
- `src/lib/i18n/server.ts` — New server-side locale helper
- `src/lib/i18n/context.tsx` — Update to set cookie

---

### Plan 07: Migrate Existing Events

**Goal:** Translate and populate bilingual fields for all existing events.

**Tasks:**
1. Create migration script `scripts/migrate-events-bilingual.ts`:
   - Fetch all events with `title` and `description` but missing `title_en`/`title_es`
   - For each event:
     - Detect source language (simple heuristic or AI)
     - If Spanish: `title_es = title`, translate to `title_en`
     - If English: `title_en = title`, translate to `title_es`
     - Same for description
     - Use batch AI calls (process 10-20 at a time for efficiency)
   - Update events with bilingual fields
   - Set `source_language` field

2. Use Anthropic Claude for batch translation:
   ```typescript
   const prompt = `
   Translate the following event titles and descriptions.
   For each event, detect the source language and provide the missing translation.

   Events: ${JSON.stringify(eventsToTranslate)}

   Return JSON array with:
   [
     {
       "id": "event-uuid",
       "source_language": "es",
       "title_en": "translated title",
       "description_en": "translated description"
     },
     ...
   ]
   `;
   ```

3. Run migration script locally first (test environment)
4. Verify translations are accurate (sample review)
5. Run in production (or staging)
6. Log migration results (count of events migrated, any errors)

**Verification:**
- [ ] All existing events have bilingual fields populated
- [ ] Translations are natural and accurate (manual review)
- [ ] `source_language` set for all events
- [ ] No events lost or corrupted
- [ ] Can query events in both languages

**Files:**
- `scripts/migrate-events-bilingual.ts` — Migration script
- `.planning/phases/08-bilingual-events/migration-results.md` — Log of migration

**Cost Estimate:**
- ~100 existing events (estimated)
- ~500 tokens per event (title + description input/output)
- Total: ~50,000 tokens
- Claude Haiku cost: ~$0.01 (negligible)

---

### Plan 08: Update Metadata and HTML Lang

**Goal:** Make page title, meta description, and `<html lang>` attribute locale-aware.

**Tasks:**
1. Add client component to set document metadata dynamically:
   ```typescript
   // src/components/LocaleMetadata.tsx
   'use client';

   import { useEffect } from 'react';
   import { useI18n } from '@/lib/i18n';

   export function LocaleMetadata() {
     const { locale, t } = useI18n();

     useEffect(() => {
       // Update html lang attribute
       document.documentElement.lang = locale;

       // Update document title
       document.title = locale === 'es'
         ? 'EventosGC - Descubre Eventos Locales en Las Palmas'
         : 'EventosGC - Discover Local Events in Las Palmas';

       // Update meta description
       const metaDescription = document.querySelector('meta[name="description"]');
       if (metaDescription) {
         metaDescription.setAttribute('content', locale === 'es'
           ? 'Encuentra conciertos, exposiciones, talleres y más en Las Palmas de Gran Canaria'
           : 'Find concerts, exhibitions, workshops and more in Las Palmas de Gran Canaria'
         );
       }
     }, [locale]);

     return null;
   }
   ```

2. Add `LocaleMetadata` to root layout:
   ```typescript
   // src/app/layout.tsx
   import { LocaleMetadata } from '@/components/LocaleMetadata';

   export default function RootLayout({ children }: { children: React.ReactNode }) {
     return (
       <html lang="en"> {/* Default, will be updated client-side */}
         <body>
           <I18nProvider>
             <LocaleMetadata />
             {children}
           </I18nProvider>
         </body>
       </html>
     );
   }
   ```

3. Test metadata updates when switching language

**Verification:**
- [ ] `<html lang>` updates to "en" or "es"
- [ ] Document title updates with language
- [ ] Meta description updates with language
- [ ] No console errors or warnings

**Files:**
- `src/components/LocaleMetadata.tsx` — New metadata component
- `src/app/layout.tsx` — Add metadata component

---

### Plan 09: Testing and Documentation

**Goal:** Ensure comprehensive test coverage and update documentation.

**Tasks:**
1. Add unit tests for bilingual parser:
   - Test Spanish source → EN translation
   - Test English source → ES translation
   - Test mixed/bilingual source
   - Test missing description (null handling)

2. Add integration tests for queries:
   - Fetch events with locale='en' → verify English content
   - Fetch events with locale='es' → verify Spanish content
   - Test fallback logic (missing translations)

3. Add E2E test for language switching:
   - Load page with EN locale
   - Verify event titles in English
   - Switch to Spanish
   - Verify event titles in Spanish
   - Verify date formatting updated

4. Update documentation:
   - Add section to README: "Bilingual Event Content"
   - Document parser behavior (auto-translation)
   - Document query layer locale parameter
   - Update migration docs with bilingual schema

5. Add JSDoc comments to new functions

**Verification:**
- [ ] Test coverage >90% for new code
- [ ] All tests pass: `npm test`
- [ ] E2E test passes
- [ ] Documentation updated and accurate

**Files:**
- `src/lib/ingestion/__tests__/parser.test.ts` — Add bilingual tests
- `src/lib/queries/__tests__/events.test.ts` — Add locale tests
- `README.md` — Update with bilingual info
- `.planning/phases/08-bilingual-events/08-SUMMARY.md` — Phase summary

---

### Plan 10: Cleanup and Optimize (Optional)

**Goal:** Remove fallback columns and optimize storage after full migration.

**Tasks:**
1. After verifying bilingual migration successful for 30+ days:
   - Create migration `003_remove_legacy_columns.sql`:
     ```sql
     ALTER TABLE events DROP COLUMN title;
     ALTER TABLE events DROP COLUMN description;

     -- Add NOT NULL constraints to bilingual columns
     ALTER TABLE events ALTER COLUMN title_en SET NOT NULL;
     ALTER TABLE events ALTER COLUMN title_es SET NOT NULL;
     ```

2. Remove fallback logic from code:
   - Update `toEventCardProps()` to remove `?? row.title` fallbacks
   - Update types to remove old fields

3. Test thoroughly before executing in production

**Verification:**
- [ ] Legacy columns dropped successfully
- [ ] No events lost
- [ ] Application works without fallback logic
- [ ] Database size reduced (minor)

**Files:**
- `supabase/migrations/003_remove_legacy_columns.sql` — Cleanup migration

**Note:** This plan is optional and can be deferred or skipped if keeping legacy columns as a safety net is preferred.

---

## Dependencies

**Blocks:**
- None (all event sources will benefit)

**Blocked By:**
- None (can run independently of Phase 07 Meetup)
- Note: If Phase 07 executed first, update Meetup pipeline in Plan 04

**External Dependencies:**
- Anthropic Claude API (already in use)
- Supabase migrations (already using)

## Risk Assessment

**High Risk:**
- Migration script errors could corrupt existing events (mitigation: test in staging, backup DB first)
- Translation quality issues (mitigation: manual review of samples, use Claude for quality)

**Medium Risk:**
- SSR/CSR mismatch with locale (mitigation: use cookies, test thoroughly)
- Performance impact of larger queries (mitigation: selective column fetching, existing indexes work)

**Low Risk:**
- Cost of AI translation (mitigation: cost is ~$0.01 per 100 events, negligible)

## Estimated Complexity

- **Schema Migration:** Low (straightforward ALTER TABLE)
- **Parser Updates:** Medium (prompt engineering, testing both languages)
- **Type Updates:** Low (mechanical changes)
- **Pipeline Updates:** Medium (three pipelines to update)
- **Query Layer:** Medium (locale parameter, selection logic)
- **Page Updates:** Medium (SSR locale detection)
- **Data Migration:** Medium (batch translation script)
- **Metadata Updates:** Low (simple client component)
- **Testing:** High (comprehensive coverage needed)
- **Cleanup:** Low (optional, simple DROP COLUMN)

**Overall:** Medium-High complexity, 10 plans (9 required + 1 optional)

## Notes

- Execute Plan 01 (schema) first, then Plans 02-06 can run in parallel groups
- Plan 07 (data migration) should run after pipelines updated (Plans 04-05)
- Plan 08 (metadata) can run anytime, independent
- Plan 09 (testing) continuous throughout
- Plan 10 (cleanup) only after 30+ days of production validation
- Coordinate with Phase 07 (Meetup): if Meetup ships first, update it in Plan 04; if this ships first, Phase 07 includes bilingual from start
- Consider creating a "bilingual event preview" feature to let users verify translations before migration goes live
