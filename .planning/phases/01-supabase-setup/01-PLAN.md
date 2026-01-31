---
phase: 01-supabase-setup
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/supabase/client.ts, src/lib/supabase/server.ts, src/types/event.ts, .env.local.example]
autonomous: false
user_setup:
  - service: supabase
    why: "Event storage and API"
    env_vars:
      - name: NEXT_PUBLIC_SUPABASE_URL
        source: "Supabase Dashboard -> Project Settings -> API -> Project URL"
      - name: NEXT_PUBLIC_SUPABASE_ANON_KEY
        source: "Supabase Dashboard -> Project Settings -> API -> anon/public key"
    dashboard_config:
      - task: "Create a new Supabase project"
        location: "https://supabase.com/dashboard -> New Project"

must_haves:
  truths:
    - Supabase client can connect to the project from Next.js
    - Event TypeScript types match the database schema
    - Both server-side and client-side Supabase clients are available
  artifacts:
    - src/lib/supabase/client.ts (browser client)
    - src/lib/supabase/server.ts (server client)
    - src/types/event.ts (Event type definition)
    - .env.local.example (template for required env vars)
  key_links:
    - env vars loaded -> Supabase client initialized (if missing, all queries fail)
    - Event type -> matches DB schema (if mismatched, runtime errors)
---

<objective>
Set up Supabase client configuration and TypeScript types for the EventosGC app.

Purpose: Establish the data layer foundation so the app can read/write events from Supabase.
Output: Supabase client helpers (server + browser), Event type definition, env var template.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@src/components/EventCard.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Event type and Supabase clients</name>
  <files>
    src/types/event.ts
    src/lib/supabase/client.ts
    src/lib/supabase/server.ts
    .env.local.example
  </files>
  <action>
    1. Create `src/types/event.ts` with an `Event` interface matching the planned schema:
       - id: string (UUID)
       - title: string
       - description: string | null
       - date_start: string (ISO date)
       - date_end: string | null
       - time: string | null
       - location: string
       - category: CategoryVariant (import from components/CategoryLabel)
       - image_url: string | null
       - source: 'instagram' | 'slack' | 'manual'
       - source_url: string | null
       - created_at: string

    2. Create `src/lib/supabase/client.ts` — browser Supabase client using `createBrowserClient` from @supabase/ssr. Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from env.

    3. Create `src/lib/supabase/server.ts` — server Supabase client using `createServerClient` from @supabase/ssr with cookie handling for Next.js App Router (use `cookies()` from next/headers).

    4. Create `.env.local.example` with placeholder values for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.
  </action>
  <verify>
    - TypeScript compiles: `npx tsc --noEmit`
    - Files exist at expected paths
  </verify>
  <done>
    - Event type defined with all fields matching planned schema
    - Browser and server Supabase clients export correctly
    - .env.local.example documents required env vars
  </done>
</task>

<task type="checkpoint:human-action">
  <name>Task 2: User creates Supabase project and provides credentials</name>
  <action>
    User must:
    1. Create a new Supabase project at https://supabase.com/dashboard
    2. Copy the Project URL and anon key from Project Settings -> API
    3. Create `.env.local` from `.env.local.example` and fill in the values
  </action>
  <verify>
    - .env.local exists with real values (not placeholders)
  </verify>
  <done>
    - Supabase project created
    - .env.local contains valid NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  </done>
</task>

</tasks>

<verification>
- `npx tsc --noEmit` passes
- .env.local.example exists with documented vars
- Supabase client files import without errors
</verification>

<success_criteria>
- TypeScript types for Event are defined and importable
- Supabase browser and server clients are configured
- User has a working Supabase project with credentials in .env.local
</success_criteria>

<output>
After completion, create `.planning/phases/01-supabase-setup/01-SUMMARY.md`
</output>
