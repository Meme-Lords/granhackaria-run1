---
phase: 06-polish-deploy
plan: 03
type: execute
wave: 2
depends_on: [01, 02]
files_modified: [next.config.ts, .env.local.example]
autonomous: false

must_haves:
  truths:
    - App is deployed and accessible via a public URL
    - Environment variables configured in production
    - Cron job running in production
    - All event sources flowing into production database
  artifacts:
    - Deployed app on Vercel (or chosen platform)
    - Production environment variables set
  key_links:
    - Vercel project -> GitHub repo (if not connected, no deploys)
    - Production env vars -> Supabase + RapidAPI + Slack + Anthropic (if missing, features broken)
    - Vercel cron -> ingestion route (if not configured, no automation)
---

<objective>
Deploy the app to production and verify everything works end-to-end.

Purpose: Ship the app so real users can discover events in Gran Canaria.
Output: Live, publicly accessible EventosGC application.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@vercel.json
@next.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Prepare production configuration</name>
  <files>
    next.config.ts
    .env.local.example
  </files>
  <action>
    1. Update next.config.ts:
       - Add image domains for Unsplash and Instagram CDN (images.unsplash.com, scontent*.cdninstagram.com)
       - Ensure any needed rewrites or headers are configured

    2. Verify .env.local.example has ALL required env vars documented:
       - NEXT_PUBLIC_SUPABASE_URL
       - NEXT_PUBLIC_SUPABASE_ANON_KEY
       - RAPIDAPI_KEY
       - ANTHROPIC_API_KEY
       - SLACK_BOT_TOKEN
       - SLACK_CHANNEL_ID
       - INSTAGRAM_ACCOUNTS
       - CRON_SECRET

    3. Ensure `npm run build` passes cleanly with no warnings
  </action>
  <verify>
    - `npm run build` succeeds
    - .env.local.example lists all env vars
    - next.config.ts has image domains
  </verify>
  <done>
    - Production config ready
    - All env vars documented
    - Build clean
  </done>
</task>

<task type="checkpoint:human-action">
  <name>Task 2: Deploy to Vercel and configure production</name>
  <action>
    User must:
    1. Connect the GitHub repo to Vercel (https://vercel.com/new)
    2. Set all environment variables in Vercel project settings
    3. Deploy
    4. Verify the live URL loads and shows events
    5. Verify cron job is registered (Vercel dashboard -> Crons)
    6. Trigger a manual ingestion to confirm production pipeline works
  </action>
  <verify>
    - App accessible at production URL
    - Events visible on the homepage
    - Cron listed in Vercel dashboard
  </verify>
  <done>
    - App live and publicly accessible
    - All environment variables set in production
    - Cron job scheduled and running
    - Events flowing from Instagram and Slack into production
  </done>
</task>

</tasks>

<verification>
- Production URL loads successfully
- Events display from production Supabase
- Cron triggers ingestion on schedule
</verification>

<success_criteria>
- EventosGC is live and accessible
- Events from both sources appearing in production
- Automated ingestion running
- App is shippable
</success_criteria>

<output>
After completion, create `.planning/phases/06-polish-deploy/03-SUMMARY.md`
</output>
