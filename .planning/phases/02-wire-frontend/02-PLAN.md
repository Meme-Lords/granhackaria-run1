---
phase: 02-wire-frontend
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified: [src/app/page.tsx]
autonomous: false

must_haves:
  truths:
    - Homepage displays events from Supabase, not hardcoded data
    - Events are grouped correctly into Today / Tomorrow / This Week
    - Adding an event in Supabase makes it appear after page refresh
  artifacts:
    - src/app/page.tsx (updated to use server-side data fetching)
  key_links:
    - page.tsx -> query functions -> Supabase (full data pipeline)
    - Empty query result -> graceful UI (no crash on zero events)
---

<objective>
Replace hardcoded event arrays in page.tsx with live Supabase queries.

Purpose: Make the homepage data-driven so events flow from the database to the UI.
Output: Updated page.tsx using server-side data fetching.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/app/page.tsx
@src/lib/queries/events.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Wire page.tsx to Supabase queries</name>
  <files>
    src/app/page.tsx
  </files>
  <action>
    1. Convert EventListingsPage to an async server component
    2. Import getTodayEvents, getTomorrowEvents, getThisWeekEvents from queries module
    3. Call all three at the top of the component
    4. Remove all hardcoded event arrays (todayEvents, tomorrowEvents, weekEvents)
    5. Pass query results to EventSection components
    6. Handle empty states: if a section has no events, still render the section header but show a "No events" message instead of an empty grid
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - `npm run build` succeeds
    - Page renders with seed data from Supabase
  </verify>
  <done>
    - No hardcoded event data remains in page.tsx
    - Page fetches from Supabase on every request
    - Empty sections show a fallback message
  </done>
</task>

<task type="checkpoint:human-verify">
  <name>Task 2: Verify live data renders correctly</name>
  <action>
    User verifies:
    1. Run `npm run dev` and open http://localhost:3000
    2. Confirm events from Supabase seed data appear correctly
    3. Confirm Today/Tomorrow/This Week grouping is correct
    4. Add a test event via Supabase dashboard, refresh page, confirm it appears
  </action>
  <verify>
    - Visual confirmation that events render from DB
    - New event appears after refresh
  </verify>
  <done>
    - Homepage shows live data from Supabase
    - Data pipeline working end-to-end
  </done>
</task>

</tasks>

<verification>
- Build passes
- Homepage renders events from Supabase
- Sections group events by correct date ranges
</verification>

<success_criteria>
- Zero hardcoded event data in the codebase
- Full data pipeline: Supabase -> query functions -> page.tsx -> EventCard
- Verified visually by user
</success_criteria>

<output>
After completion, create `.planning/phases/02-wire-frontend/02-SUMMARY.md`
</output>
