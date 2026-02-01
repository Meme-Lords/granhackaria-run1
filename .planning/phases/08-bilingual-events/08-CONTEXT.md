# Phase 08: Bilingual Event Content — CONTEXT

## Why Bilingual Event Content?

EventosGC already has a fully bilingual UI with seamless language switching between English and Spanish. Users can toggle between languages and all static content (navigation, hero, sections, categories, footer, about/privacy/terms pages) instantly switches.

However, **event content (titles and descriptions) remains in the original source language** because they're stored as single-language text in the database. This creates a jarring user experience:

**Current behavior:**
- User selects Spanish → UI switches to Spanish
- Event title: "Jazz Night at Beach Bar" (stays in English)
- User selects English → UI switches to English
- Event title: "Noche de Salsa en Vegueta" (stays in Spanish)

**Desired behavior:**
- User selects Spanish → UI **and events** in Spanish
- Event title: "Noche de Jazz en Beach Bar"
- User selects English → UI **and events** in English
- Event title: "Salsa Night in Vegueta"

This phase makes event content match the bilingual UI quality.

---

## Current i18n Architecture

EventosGC has a robust client-side i18n system:

### Structure
```
src/lib/i18n/
├── index.ts           # Exports
├── context.tsx        # I18nProvider, useI18n hook
└── translations.ts    # Locale type, translation objects
```

### Core Components

**Locale Type:**
```typescript
export type Locale = "en" | "es";
```

**Translation Object:**
```typescript
export const translations = {
  en: {
    nav: { events: "Events", about: "About" },
    hero: { title: "Discover Local Events", ... },
    sections: { today: "Today", tomorrow: "Tomorrow", ... },
    categories: { music: "Music", arts: "Arts", ... },
    // ... full English translations
  },
  es: {
    nav: { events: "Eventos", about: "Nosotros" },
    hero: { title: "Descubre Eventos Locales", ... },
    sections: { today: "Hoy", tomorrow: "Mañana", ... },
    categories: { music: "Música", arts: "Arte", ... },
    // ... full Spanish translations
  }
};
```

**I18nProvider:**
- Wraps app in `app/layout.tsx`
- Manages locale state (localStorage persistence)
- Provides `useI18n()` hook to access locale and translations

**Usage in Components:**
```typescript
import { useI18n } from '@/lib/i18n';

function EventSection() {
  const { locale, t } = useI18n();
  return <h2>{t.sections.today}</h2>; // "Today" or "Hoy"
}
```

### Language Toggle
- Navbar component with EN/ES buttons
- Clicking toggles `locale` state
- All components using `t.*` re-render with new language
- Preference saved to localStorage

---

## Current Event Data Flow

### Database Schema
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,              -- Single language
  description TEXT,                  -- Single language
  date_start DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL,              -- 'instagram', 'slack', 'manual'
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### Ingestion Flow

1. **Source** → Instagram post or Slack message (mixed languages)
2. **Parser** → AI extracts event info (`parseEventFromText()`)
   ```typescript
   // Current output
   {
     title: "Jazz Night at Beach Bar",  // Whatever language was posted
     description: "Live jazz...",        // Original language
     date_start: "2026-02-15",
     // ...
   }
   ```
3. **Pipeline** → Upserts to Supabase
4. **Query** → Fetches events
   ```typescript
   const { data } = await supabase
     .from("events")
     .select("*")
     .eq("date_start", today);
   ```
5. **Component** → Displays title/description as-is

**Gap:** No translation or language detection happens. Event content language is arbitrary.

---

## Proposed Bilingual Architecture

### Database Schema (Updated)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,              -- LEGACY: Keep temporarily for migration
  description TEXT,                  -- LEGACY: Keep temporarily
  title_en TEXT,                     -- NEW: English title
  title_es TEXT,                     -- NEW: Spanish title
  description_en TEXT,               -- NEW: English description
  description_es TEXT,               -- NEW: Spanish description
  source_language VARCHAR(2),        -- NEW: 'en', 'es', 'unknown'
  date_start DATE NOT NULL,
  time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  source TEXT NOT NULL,
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

**Migration Path:**
1. Add new columns (keep legacy)
2. Update pipelines to populate both
3. Migrate existing events (translate)
4. Switch queries to use new columns
5. (Optional) Drop legacy columns later

### Ingestion Flow (Updated)

1. **Source** → Instagram/Slack post
2. **Parser** → AI extracts **and translates** in one call
   ```typescript
   // New output
   {
     title_en: "Jazz Night at Beach Bar",
     title_es: "Noche de Jazz en Beach Bar",
     description_en: "Live jazz performance...",
     description_es: "Actuación de jazz en vivo...",
     source_language: "en",  // Detected from original post
     date_start: "2026-02-15",
     // ...
   }
   ```
3. **Pipeline** → Upserts bilingual fields
4. **Query** → Fetches events + selects by locale
   ```typescript
   const { data } = await supabase
     .from("events")
     .select("title_en, title_es, description_en, description_es, ...")
     .eq("date_start", today);

   // In toEventCardProps:
   const title = locale === 'es' ? row.title_es : row.title_en;
   ```
5. **Component** → Displays correct language based on `locale`

---

## AI Translation Strategy

### Why AI Translation (vs. Manual or API Services)?

**Advantages:**
1. **Already integrated:** Using Anthropic Claude for event extraction
2. **Context-aware:** AI understands event context (e.g., "Salsa Night" vs. "Chemistry Lab Night")
3. **Cultural adaptation:** Can adapt culturally (e.g., "Tapas Tour" → "Tour de Tapas", not literal word-for-word)
4. **Single API call:** Extract + translate in one prompt (cost-efficient)
5. **Quality:** Claude Opus/Sonnet produces natural, high-quality translations
6. **Batch processing:** Can translate multiple events in one call

**Alternative (not chosen):**
- Google Translate API: Cheaper but literal, misses context, separate API call
- DeepL API: Good quality but separate service, extra dependency
- Manual: Not scalable for hundreds of events

### Prompt Engineering for Bilingual Extraction

**Current parser prompt (simplified):**
```typescript
const prompt = `
Extract event information from this text.
Return JSON with: title, description, date, location, category, etc.
`;
```

**Updated bilingual prompt:**
```typescript
const prompt = `
Extract event information from this text and provide a bilingual response.

Steps:
1. Detect the source language (en, es, or mixed)
2. Extract event details (title, date, location, category, etc.)
3. Provide BOTH English and Spanish versions:
   - If source is Spanish: keep original as title_es/description_es, translate to title_en/description_en
   - If source is English: keep original as title_en/description_en, translate to title_es/description_es
   - If mixed/bilingual: extract both or best effort
4. Ensure translations are natural, culturally appropriate, and preserve event tone

Event text: ${text}

Return JSON:
{
  "title_en": "English title",
  "title_es": "Título en español",
  "description_en": "English description or null",
  "description_es": "Descripción en español o null",
  "source_language": "en" | "es" | "unknown",
  "date_start": "YYYY-MM-DD",
  "time": "HH:MM",
  "location": "Location string",
  "category": "music" | "arts" | ...,
  "ticket_price": "Price or null"
}

If the text is not an event, return null.
`;
```

**Example Input/Output:**

*Input (Spanish post):*
```
🎵 Noche de Jazz en Vivo
📍 Beach Bar, Las Canteras
📅 Viernes 15 Feb, 21:00
💰 Entrada gratuita
```

*Output:*
```json
{
  "title_en": "Live Jazz Night",
  "title_es": "Noche de Jazz en Vivo",
  "description_en": "Free jazz performance at Beach Bar, Las Canteras",
  "description_es": "Actuación de jazz gratuita en Beach Bar, Las Canteras",
  "source_language": "es",
  "date_start": "2026-02-15",
  "time": "21:00",
  "location": "Beach Bar, Las Canteras",
  "category": "music",
  "ticket_price": "Free"
}
```

### Cost Analysis

**Current cost (per event):**
- Input: ~100 tokens (caption text)
- Output: ~100 tokens (JSON event)
- Total: ~200 tokens/event

**Bilingual cost (per event):**
- Input: ~100 tokens (caption text) + ~50 tokens (instruction overhead)
- Output: ~200 tokens (JSON with both languages)
- Total: ~350 tokens/event

**Price difference:**
- Claude Haiku: $0.25 per 1M input tokens, $1.25 per 1M output tokens
- Current: 100 × $0.25/1M + 100 × $1.25/1M = ~$0.00015/event
- Bilingual: 150 × $0.25/1M + 200 × $1.25/1M = ~$0.00029/event
- **Increase: +$0.00014/event** (less than 0.02 cents)

**Daily cost (50 events/day):**
- Current: ~$0.0075/day = $2.74/year
- Bilingual: ~$0.0145/day = $5.29/year
- **Increase: ~$2.55/year** (negligible)

**Migration cost (one-time, ~100 existing events):**
- ~100 events × ~350 tokens = 35,000 tokens
- Cost: ~$0.01 (one cent)

**Conclusion:** Bilingual extraction adds minimal cost (<$3/year) for massive UX improvement.

---

## Query Layer Strategy

### Server-Side Locale Detection

**Challenge:** `page.tsx` is a server component (async, can't use `useI18n()` hook directly)

**Options:**

**Option A: Read from cookies (Recommended)**
```typescript
// src/lib/i18n/server.ts
import { cookies } from 'next/headers';
import type { Locale } from './translations';

export function getLocaleFromRequest(): Locale {
  const cookieStore = cookies();
  const localeCookie = cookieStore.get('locale');
  return (localeCookie?.value === 'es' ? 'es' : 'en') as Locale;
}

// In page.tsx
const locale = getLocaleFromRequest();
const events = await getTodayEvents(locale);
```

**Option B: Fetch both, select client-side**
```typescript
// Fetch all fields, let client component select
const { data } = await supabase.from("events").select("title_en, title_es, ...");

// Client component:
const { locale } = useI18n();
const title = locale === 'es' ? event.title_es : event.title_en;
```

**Option C: Make page client component**
```typescript
'use client';

import { useI18n } from '@/lib/i18n';

export default function HomePage() {
  const { locale } = useI18n();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`/api/events?locale=${locale}`).then(...);
  }, [locale]);

  // ...
}
```

**Chosen: Option A (cookies)**
- Server-rendered (fast initial load)
- SEO-friendly (content in HTML)
- Consistent with existing i18n pattern (localStorage + cookies)
- No hydration issues

### Fallback Logic

Handle missing translations gracefully:

```typescript
function toEventCardProps(row: EventRow, locale: Locale): EventCardProps {
  // Prefer locale-specific, fallback to other language, then legacy field
  const title = locale === 'es'
    ? (row.title_es ?? row.title_en ?? row.title)  // Spanish → English → Legacy
    : (row.title_en ?? row.title_es ?? row.title); // English → Spanish → Legacy

  const description = locale === 'es'
    ? (row.description_es ?? row.description_en ?? row.description)
    : (row.description_en ?? row.description_es ?? row.description);

  return { title, description, /* ... */ };
}
```

**Why multi-level fallback?**
- During migration, some events may only have legacy fields
- AI translation may rarely fail for a language
- Ensures users always see *something*, even if not preferred language

---

## Migration Strategy

### Existing Event Translation

**Challenge:** ~100 existing events have only single-language `title` and `description`

**Approach:**
1. Detect source language (heuristic or AI)
2. Batch translate missing language
3. Populate bilingual fields
4. Set `source_language`

**Script flow:**
```typescript
// scripts/migrate-events-bilingual.ts

async function migrateEvents() {
  // 1. Fetch events missing bilingual fields
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .is("title_en", null);

  // 2. Detect language and prepare translation batches
  const batches = chunkArray(events, 20); // Process 20 at a time

  for (const batch of batches) {
    // 3. Call AI to translate batch
    const translations = await batchTranslate(batch);

    // 4. Update events with bilingual fields
    for (const translation of translations) {
      await supabase
        .from("events")
        .update({
          title_en: translation.title_en,
          title_es: translation.title_es,
          description_en: translation.description_en,
          description_es: translation.description_es,
          source_language: translation.source_language
        })
        .eq("id", translation.id);
    }
  }

  console.log(`Migrated ${events.length} events`);
}
```

**Batch translation prompt:**
```typescript
const prompt = `
Translate the following events to both English and Spanish.
For each event, detect the source language and provide the missing translation.

Events:
${events.map(e => `ID: ${e.id}, Title: "${e.title}", Description: "${e.description}"`).join('\n')}

Return JSON array:
[
  {
    "id": "uuid",
    "source_language": "es",
    "title_en": "Translated title",
    "title_es": "Original title",
    "description_en": "Translated description",
    "description_es": "Original description"
  },
  ...
]
`;
```

**Safety measures:**
- Run in staging first
- Backup database before production run
- Log all translations for review
- Manual spot-check sample (e.g., 10 random events)
- Rollback plan: restore from backup if issues

---

## Date Formatting

### Current Issue
```typescript
// src/lib/queries/events.ts
function formatWeekdayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
// Always returns: "Mon, Jan 6"
```

### Solution
```typescript
function formatWeekdayDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale === 'es' ? 'es-ES' : 'en-US', {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
// English: "Mon, Jan 6"
// Spanish: "lun, 6 ene"
```

**Used in:**
- `toEventCardProps()` when `!showClock` (i.e., tomorrow and this week sections)
- Event modal/detail views (if added later)

---

## Metadata and HTML Lang

### Current State
```typescript
// app/layout.tsx
export const metadata = {
  title: 'EventosGC - Discover Local Events',
  description: 'Find concerts, exhibitions, workshops and more in Las Palmas de Gran Canaria',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en"> {/* Hardcoded */}
      <body>{children}</body>
    </html>
  );
}
```

**Issue:**
- `<html lang="en">` doesn't change with locale
- Document title and meta description don't change

### Solution

**Client-side metadata update:**
```typescript
// src/components/LocaleMetadata.tsx
'use client';

import { useEffect } from 'react';
import { useI18n } from '@/lib/i18n';

export function LocaleMetadata() {
  const { locale } = useI18n();

  useEffect(() => {
    // Update <html lang>
    document.documentElement.lang = locale;

    // Update document title
    document.title = locale === 'es'
      ? 'EventosGC - Descubre Eventos Locales en Las Palmas'
      : 'EventosGC - Discover Local Events in Las Palmas';

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', locale === 'es'
        ? 'Encuentra conciertos, exposiciones, talleres y más en Las Palmas de Gran Canaria'
        : 'Find concerts, exhibitions, workshops and more in Las Palmas de Gran Canaria'
      );
    }
  }, [locale]);

  return null; // No UI, just side effects
}

// In layout.tsx:
<I18nProvider>
  <LocaleMetadata />
  {children}
</I18nProvider>
```

**Why client-side?**
- Server components can't access `useI18n()` hook
- Metadata needs to update dynamically with language toggle
- Acceptable for SEO (initial HTML has default, updates after hydration)

---

## Testing Strategy

### Unit Tests

**Parser (bilingual extraction):**
```typescript
describe('parseEventFromText (bilingual)', () => {
  it('extracts Spanish event and translates to English', async () => {
    const text = 'Concierto de Jazz, Viernes 20:00, Bar Playa';
    const result = await parseEventFromText(text, 'instagram', 'url', null);

    expect(result.title_es).toBe('Concierto de Jazz');
    expect(result.title_en).toBe('Jazz Concert');
    expect(result.source_language).toBe('es');
  });

  it('extracts English event and translates to Spanish', async () => {
    const text = 'Art Exhibition, Saturday 18:00, Gallery';
    const result = await parseEventFromText(text, 'instagram', 'url', null);

    expect(result.title_en).toBe('Art Exhibition');
    expect(result.title_es).toBe('Exposición de Arte');
    expect(result.source_language).toBe('en');
  });
});
```

**Query layer (locale selection):**
```typescript
describe('toEventCardProps', () => {
  it('returns Spanish content when locale=es', () => {
    const row = {
      title_en: 'Jazz Night',
      title_es: 'Noche de Jazz',
      description_en: 'Live jazz',
      description_es: 'Jazz en vivo',
      // ...
    };

    const props = toEventCardProps(row, true, 'es');
    expect(props.title).toBe('Noche de Jazz');
    expect(props.description).toBe('Jazz en vivo');
  });

  it('falls back to available language if missing', () => {
    const row = {
      title_en: 'Jazz Night',
      title_es: null,  // Missing Spanish
      // ...
    };

    const props = toEventCardProps(row, true, 'es');
    expect(props.title).toBe('Jazz Night'); // Fallback to English
  });
});
```

### Integration Tests

**Pipeline (end-to-end):**
```typescript
it('ingests event with bilingual fields', async () => {
  const mockPost = {
    caption: 'Noche de Salsa, Sábado 21:00',
    image_url: 'https://...',
    permalink: 'https://instagram.com/p/...',
  };

  await ingestFromInstagram([mockAccount]);

  const { data: events } = await supabase
    .from('events')
    .select('*')
    .eq('source_url', mockPost.permalink);

  expect(events[0].title_es).toBe('Noche de Salsa');
  expect(events[0].title_en).toBeTruthy(); // Has English translation
  expect(events[0].source_language).toBe('es');
});
```

### E2E Tests (Playwright/Cypress)

```typescript
test('event titles switch with language toggle', async ({ page }) => {
  await page.goto('/');

  // Check English (default)
  const titleEN = await page.locator('.event-card').first().textContent();
  expect(titleEN).toContain('Jazz Night'); // English title

  // Switch to Spanish
  await page.click('[data-testid="language-toggle-es"]');
  await page.waitForTimeout(100); // Wait for re-render

  // Check Spanish
  const titleES = await page.locator('.event-card').first().textContent();
  expect(titleES).toContain('Noche de Jazz'); // Spanish title
});
```

---

## Files to Create/Modify

### New Files
```
supabase/migrations/
└── 002_add_bilingual_columns.sql

scripts/
└── migrate-events-bilingual.ts

src/lib/i18n/
└── server.ts                       # Server-side locale helpers

src/components/
└── LocaleMetadata.tsx             # Client-side metadata updater

.planning/phases/08-bilingual-events/
├── migration-rollback.md          # Rollback instructions
├── migration-results.md           # Migration logs
└── 08-SUMMARY.md                  # Phase summary
```

### Modified Files
```
src/lib/ingestion/
├── types.ts                       # Add bilingual fields to RawEvent
├── parser.ts                      # Update to return bilingual
├── instagram-pipeline.ts          # Use bilingual parser
├── slack-pipeline.ts              # Use bilingual parser
└── meetup-pipeline.ts             # Use bilingual parser (if exists)

src/lib/queries/
└── events.ts                      # Add locale param, select by locale

src/app/
├── layout.tsx                     # Add LocaleMetadata component
└── page.tsx                       # Get locale, pass to queries

src/lib/i18n/
└── context.tsx                    # Set locale cookie on change

README.md                          # Document bilingual feature
```

---

## Summary

This phase transforms EventosGC from a bilingual UI with monolingual content to a **fully bilingual event platform** where every piece of text—from navigation to event titles—responds to the user's language preference.

**Key Changes:**
1. Database stores both English and Spanish for all event content
2. AI parser extracts and translates in a single call (minimal cost)
3. Queries select content by locale
4. Date formatting respects locale
5. Metadata and HTML lang update dynamically

**User Impact:**
- Seamless experience: toggle language, *everything* switches
- No missing translations (fallback logic ensures robustness)
- Instant switching (no loading, pre-stored translations)

**Technical Impact:**
- Minimal performance overhead (selective column fetching)
- Low cost increase (~$3/year for AI translation)
- Clean architecture (follows existing i18n patterns)
- Migration-safe (fallback columns, reversible)
