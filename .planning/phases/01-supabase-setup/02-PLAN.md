---
phase: 01-supabase-setup
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified: [supabase/migrations/001_create_events.sql, src/lib/supabase/seed.ts]
autonomous: true

must_haves:
  truths:
    - Events table exists in Supabase with correct columns and types
    - Seed data can be inserted and queried
    - Date-based queries work (today, tomorrow, this week)
  artifacts:
    - supabase/migrations/001_create_events.sql (schema migration)
    - src/lib/supabase/seed.ts (seed script)
  key_links:
    - Migration SQL -> Supabase project (if not run, no table exists)
    - Seed data categories -> CategoryVariant type (must match)
    - date_start column -> date-based query filters (if wrong type, queries break)
---

<objective>
Create the events database schema and seed it with sample data matching the current hardcoded events.

Purpose: Establish the database structure so the frontend can query real events. Seed data ensures we can verify the frontend wiring in Phase 02 without waiting for real ingestion.
Output: SQL migration file, seed script with 9 sample events matching current UI.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/types/event.ts
@src/app/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create events table migration</name>
  <files>
    supabase/migrations/001_create_events.sql
  </files>
  <action>
    Create SQL migration that creates the `events` table:

    ```sql
    CREATE TABLE events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      date_start DATE NOT NULL,
      date_end DATE,
      time TEXT,
      location TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('music', 'arts', 'food', 'sports', 'festival', 'theater', 'workshop', 'market')),
      image_url TEXT,
      source TEXT NOT NULL CHECK (source IN ('instagram', 'slack', 'manual')),
      source_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ```

    Add indexes:
    - `idx_events_date_start` on date_start (for date-range queries)
    - `idx_events_category` on category (for filtering)
    - `idx_events_source_url` UNIQUE on source_url WHERE source_url IS NOT NULL (for deduplication)

    Enable Row Level Security with a policy allowing anonymous read access (SELECT) to all events.

    This migration can be run via the Supabase SQL Editor or `supabase db push`.
  </action>
  <verify>
    - SQL file is valid (no syntax errors)
    - All columns match the Event TypeScript type from Plan 01
  </verify>
  <done>
    - Migration file exists at supabase/migrations/001_create_events.sql
    - Schema matches Event type (id, title, description, date_start, date_end, time, location, category, image_url, source, source_url, created_at)
    - Indexes defined for date_start, category, and source_url uniqueness
    - RLS enabled with anonymous read policy
  </done>
</task>

<task type="auto">
  <name>Task 2: Create seed script with sample events</name>
  <files>
    src/lib/supabase/seed.ts
  </files>
  <action>
    Create a seed script that inserts the 9 hardcoded events from `src/app/page.tsx` into Supabase.

    The script should:
    1. Import the Supabase client (use service role or anon key)
    2. Define the 9 events with proper dates:
       - todayEvents (3): use today's date
       - tomorrowEvents (3): use tomorrow's date
       - weekEvents (3): use dates within this week (matching the hardcoded days)
    3. Upsert events (so re-running doesn't duplicate)
    4. Log results (inserted count, errors)

    Make it runnable with `npx tsx src/lib/supabase/seed.ts`.

    Map the hardcoded data:
    - "Jazz Night at Alfredo Kraus" -> music, today, 20:00
    - "Contemporary Art Exhibition" -> arts, today, 18:00
    - "Tapas Festival at Vegueta" -> food, today, 12:00
    - "UD Las Palmas vs Real Madrid" -> sports, tomorrow, 17:00
    - "Canarian Folk Music Night" -> music, tomorrow, 21:30
    - "Photography Workshop" -> workshop, tomorrow, 10:00
    - "Carnival Opening Ceremony" -> festival, this Saturday
    - "Flamenco Dance Show" -> theater, this Sunday
    - "Farmers Market & Crafts" -> market, this Wednesday
  </action>
  <verify>
    - TypeScript compiles: `npx tsc --noEmit`
    - Script is runnable (after migration is applied)
  </verify>
  <done>
    - Seed script exists with all 9 events
    - Events use dynamic dates (today/tomorrow/this week) so they're always current
    - Script handles upsert to avoid duplicates
  </done>
</task>

</tasks>

<verification>
- SQL migration is syntactically valid
- Seed script compiles without errors
- All 9 hardcoded events are represented in seed data
- Event categories match CategoryVariant type
</verification>

<success_criteria>
- Migration file ready to run against Supabase
- Seed script ready to populate test data
- Schema supports all planned queries (by date, by category, dedup by source_url)
</success_criteria>

<output>
After completion, create `.planning/phases/01-supabase-setup/02-SUMMARY.md`
</output>
