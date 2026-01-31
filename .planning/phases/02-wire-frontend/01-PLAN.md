---
phase: 02-wire-frontend
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/queries/events.ts]
autonomous: true

must_haves:
  truths:
    - Events can be queried from Supabase by date range
    - Query functions return data shaped for EventCard props
  artifacts:
    - src/lib/queries/events.ts (query functions)
  key_links:
    - Supabase client -> query functions (if client broken, no data)
    - Event DB row -> EventCardProps mapping (if wrong, UI breaks)
---

<objective>
Create reusable query functions that fetch events from Supabase grouped by today, tomorrow, and this week.

Purpose: Encapsulate all Supabase queries in one module so the page component stays clean.
Output: Query module with getTodayEvents(), getTomorrowEvents(), getThisWeekEvents().
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/types/event.ts
@src/lib/supabase/server.ts
@src/components/EventCard.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create event query functions</name>
  <files>
    src/lib/queries/events.ts
  </files>
  <action>
    Create query module with:

    1. `getTodayEvents()` — fetches events where date_start = today, ordered by time
    2. `getTomorrowEvents()` — fetches events where date_start = tomorrow, ordered by time
    3. `getThisWeekEvents()` — fetches events where date_start is within the current week (excluding today and tomorrow), ordered by date_start then time
    4. Helper `mapEventToCardProps(event: Event): EventCardProps` — maps DB row to the props shape the EventCard expects (handles showClock logic: true for today events, false otherwise; formats time display for week events as "Day, Mon D")

    Use the server Supabase client. All functions should be async and handle errors gracefully (return empty array on failure, log error).
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - Functions export correctly
  </verify>
  <done>
    - Three query functions exist and return EventCardProps[]
    - Mapper correctly transforms DB rows to UI props
    - Date logic is correct for today/tomorrow/this week boundaries
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors
- Query functions handle edge cases (no events, DB errors)
</verification>

<success_criteria>
- Event query functions ready to be called from page.tsx
- DB-to-UI mapping tested via TypeScript compilation
</success_criteria>

<output>
After completion, create `.planning/phases/02-wire-frontend/01-SUMMARY.md`
</output>
