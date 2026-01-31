---
phase: 06-polish-deploy
plan: 02
type: execute
wave: 1
depends_on: []
files_modified: [src/app/layout.tsx, src/styles/globals.css, src/components/EventCard.tsx, src/components/EventSection.tsx]
autonomous: true

must_haves:
  truths:
    - App works on mobile devices (responsive layout)
    - Loading states visible while data fetches
    - Errors don't crash the page
  artifacts:
    - Updated components with responsive classes
    - Loading and error state handling
  key_links:
    - Grid columns -> screen size (if not responsive, mobile unusable)
    - Suspense boundaries -> loading UI (if missing, blank flash)
---

<objective>
Add responsive design, loading states, and error handling for production readiness.

Purpose: Ensure the app works well on all devices and handles edge cases gracefully.
Output: Responsive layouts, loading skeletons, error boundaries.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/app/page.tsx
@src/app/layout.tsx
@src/components/EventCard.tsx
@src/components/EventSection.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add responsive design and loading/error states</name>
  <files>
    src/app/layout.tsx
    src/styles/globals.css
    src/components/EventCard.tsx
    src/components/EventSection.tsx
    src/app/page.tsx
  </files>
  <action>
    1. Make EventSection grid responsive:
       - 1 column on mobile (< 640px)
       - 2 columns on tablet (640-1024px)
       - 3 columns on desktop (> 1024px)
       - Reduce horizontal padding on mobile (px-4 instead of px-12)

    2. Make Header responsive:
       - Stack or hamburger menu on mobile (simplest: hide nav links on mobile, show on md+)

    3. Make Hero responsive:
       - Smaller text on mobile
       - Reduced padding

    4. Add loading skeleton for EventCard:
       - Create a skeleton variant with pulsing placeholder blocks
       - Use React Suspense in page.tsx with skeleton fallback

    5. Add error boundary:
       - Create error.tsx in app/ directory for runtime error handling
       - Show friendly error message with retry button

    6. Add viewport meta tag in layout.tsx if missing
  </action>
  <verify>
    - `npm run build` succeeds
    - Page renders at mobile widths without horizontal scroll
  </verify>
  <done>
    - All components responsive across mobile/tablet/desktop
    - Loading skeleton visible during data fetch
    - Error boundary catches runtime errors
    - No horizontal overflow on small screens
  </done>
</task>

</tasks>

<verification>
- Build passes
- Page renders correctly at 375px, 768px, and 1280px widths
- Loading state visible (can test by adding artificial delay)
</verification>

<success_criteria>
- App usable on mobile devices
- No layout breakage at any common screen size
- Graceful loading and error states
</success_criteria>

<output>
After completion, create `.planning/phases/06-polish-deploy/02-SUMMARY.md`
</output>
