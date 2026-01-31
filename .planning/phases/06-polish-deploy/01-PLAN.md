---
phase: 06-polish-deploy
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/app/events/page.tsx, src/app/events/[category]/page.tsx, src/components/EventSection.tsx]
autonomous: true

must_haves:
  truths:
    - "View all" links navigate to a page showing all events for that time section
    - Events can be browsed by category
    - Empty states are handled gracefully
  artifacts:
    - src/app/events/page.tsx (all events page)
    - src/app/events/[category]/page.tsx (category filter page)
  key_links:
    - "View all" href -> events page route (if wrong, 404)
    - Category param -> valid CategoryVariant (if invalid, empty or error)
---

<objective>
Add "View all" pages for expanded event listings and category filtering.

Purpose: Let users browse beyond the homepage summary and filter by interest.
Output: Events listing page, category filter page, updated nav links.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/app/page.tsx
@src/components/EventSection.tsx
@src/lib/queries/events.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create "View all" and category pages</name>
  <files>
    src/app/events/page.tsx
    src/app/events/[category]/page.tsx
    src/components/EventSection.tsx
  </files>
  <action>
    1. Create `src/app/events/page.tsx`:
       - Server component that fetches all upcoming events (date_start >= today)
       - Displays in a grid, sorted by date_start then time
       - Reuses EventCard component
       - Includes Header and Footer
       - Shows category filter links at the top (all 8 categories)

    2. Create `src/app/events/[category]/page.tsx`:
       - Dynamic route filtered by category
       - Validates category param against CategoryVariant
       - Shows 404 for invalid categories
       - Same grid layout as events page

    3. Update EventSection "View all" links:
       - Today section -> /events (with today filter via query param)
       - Tomorrow section -> /events (with tomorrow filter)
       - This Week section -> /events (with week filter)

    4. Add empty state component: "No events found" message when query returns zero results.
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - `npm run build` succeeds
    - Routes resolve correctly
  </verify>
  <done>
    - /events page shows all upcoming events
    - /events/[category] filters by category
    - "View all" links work from homepage
    - Empty states handled
  </done>
</task>

</tasks>

<verification>
- Build passes
- All new routes render correctly
- Navigation works between homepage and event pages
</verification>

<success_criteria>
- Users can browse all events beyond the homepage 3-per-section limit
- Category filtering works
- No broken links or missing pages
</success_criteria>

<output>
After completion, create `.planning/phases/06-polish-deploy/01-SUMMARY.md`
</output>
