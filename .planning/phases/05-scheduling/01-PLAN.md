---
phase: 05-scheduling
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/app/api/cron/ingest/route.ts, vercel.json]
autonomous: true

must_haves:
  truths:
    - Instagram ingestion runs automatically on a schedule
    - Slack ingestion runs automatically on a short interval
    - Failed ingestions are logged and don't crash the system
    - Ingestion results are trackable (counts, errors)
  artifacts:
    - src/app/api/cron/ingest/route.ts (API route triggered by cron)
    - vercel.json (cron schedule configuration)
  key_links:
    - Cron trigger -> API route -> ingestion pipelines (if route broken, no automation)
    - Error handling -> logging (if missing, silent failures)
---

<objective>
Automate event ingestion so both Instagram and Slack sources run on a schedule without manual intervention.

Purpose: Events should flow into the app continuously without anyone running scripts.
Output: Cron-triggered API route that runs both ingestion pipelines, Vercel cron config.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/lib/ingestion/instagram-pipeline.ts
@src/lib/ingestion/slack-pipeline.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create cron API route for ingestion</name>
  <files>
    src/app/api/cron/ingest/route.ts
  </files>
  <action>
    Create a Next.js API route at `/api/cron/ingest`:

    1. GET handler (cron jobs use GET):
       - Verify authorization (check for CRON_SECRET header to prevent unauthorized triggers)
       - Run Instagram ingestion pipeline
       - Run Slack ingestion pipeline
       - Return JSON with combined results: { instagram: {inserted, skipped, errors}, slack: {inserted, skipped, errors}, timestamp }
       - Wrap each pipeline in try/catch so one source failing doesn't prevent the other
       - Log start/end timestamps and results

    2. Add CRON_SECRET to .env.local.example

    3. Use Next.js route segment config to set maxDuration (e.g., 60 seconds for Vercel)
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - Route responds to GET requests
  </verify>
  <done>
    - API route runs both ingestion pipelines
    - Each pipeline runs independently (one failure doesn't block the other)
    - Results logged and returned as JSON
    - Protected by CRON_SECRET
  </done>
</task>

<task type="auto">
  <name>Task 2: Configure Vercel cron schedule</name>
  <files>
    vercel.json
  </files>
  <action>
    Create or update vercel.json with cron configuration:

    ```json
    {
      "crons": [
        {
          "path": "/api/cron/ingest",
          "schedule": "*/15 * * * *"
        }
      ]
    }
    ```

    This runs ingestion every 15 minutes. The cron route handles both Instagram and Slack in a single invocation.

    Also add a note in the route handler about Vercel's cron behavior (Hobby plan: once daily, Pro plan: custom schedules).
  </action>
  <verify>
    - vercel.json is valid JSON
    - Cron path matches the API route
  </verify>
  <done>
    - Vercel cron configured to trigger ingestion every 15 minutes
    - Schedule documented
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles
- API route callable via curl (with CRON_SECRET header)
- vercel.json valid
</verification>

<success_criteria>
- Automated ingestion running on schedule
- Both sources (Instagram + Slack) triggered per invocation
- Failures isolated and logged
- Protected against unauthorized access
</success_criteria>

<output>
After completion, create `.planning/phases/05-scheduling/01-SUMMARY.md`
</output>
