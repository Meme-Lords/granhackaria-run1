---
phase: 04-slack-ingestion
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/ingestion/slack.ts, src/lib/ingestion/slack-pipeline.ts]
autonomous: false
user_setup:
  - service: slack
    why: "Read messages from event channels"
    env_vars:
      - name: SLACK_BOT_TOKEN
        source: "Slack API -> Your Apps -> OAuth & Permissions -> Bot User OAuth Token"
      - name: SLACK_CHANNEL_ID
        source: "Right-click channel in Slack -> View channel details -> Channel ID at bottom"
    dashboard_config:
      - task: "Create a Slack App with channels:history and channels:read scopes"
        location: "https://api.slack.com/apps -> Create New App"
      - task: "Install the app to your workspace"
        location: "Slack App -> OAuth & Permissions -> Install to Workspace"

must_haves:
  truths:
    - Messages can be read from a specific Slack channel
    - Event messages are parsed into structured event data via AI
    - Parsed events are stored in Supabase without duplicates
  artifacts:
    - src/lib/ingestion/slack.ts (Slack API client)
    - src/lib/ingestion/slack-pipeline.ts (fetch -> parse -> store pipeline)
  key_links:
    - Slack bot token -> API access (if invalid, all reads fail)
    - Channel ID -> correct channel (wrong ID = wrong or no messages)
    - Message text -> AI parser -> RawEvent (reuses parser from Phase 03)
---

<objective>
Build Slack ingestion: fetch messages from a community channel, parse events with AI, store in Supabase.

Purpose: Add Slack as the second event source, reusing the AI parser from Phase 03.
Output: Slack fetcher, ingestion pipeline, runnable as script.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/lib/ingestion/types.ts
@src/lib/ingestion/parser.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Slack fetcher and ingestion pipeline</name>
  <files>
    src/lib/ingestion/slack.ts
    src/lib/ingestion/slack-pipeline.ts
  </files>
  <action>
    1. Install @slack/web-api if not present

    2. Create `src/lib/ingestion/slack.ts`:
       - `fetchChannelMessages(channelId: string, since?: Date): Promise<SlackMessage[]>`
       - Uses Slack Web API `conversations.history` with SLACK_BOT_TOKEN
       - Filters to messages with text content (skip joins, leaves, bot messages)
       - `since` parameter limits to messages after a given timestamp (for incremental fetches)
       - Add `SlackMessage` type (ts, text, user, permalink)

    3. Create `src/lib/ingestion/slack-pipeline.ts`:
       - `ingestFromSlack(): Promise<{inserted: number, skipped: number, errors: number}>`
       - Fetch messages from SLACK_CHANNEL_ID
       - Parse each message with the AI parser (reuse parseEventFromText from Phase 03)
       - Upsert into Supabase with source='slack', source_url=message permalink
       - Deduplication via source_url
       - Track last fetch timestamp to avoid re-processing old messages
       - Runnable as script: `npx tsx src/lib/ingestion/slack-pipeline.ts`

    4. Add SLACK_BOT_TOKEN and SLACK_CHANNEL_ID to .env.local.example
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - Script is runnable (with valid env vars and Slack app configured)
  </verify>
  <done>
    - Slack messages fetched from specified channel
    - AI parser extracts event data from messages
    - Events stored in Supabase with deduplication
    - Runnable as standalone script
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles
- Pipeline runs and produces events from Slack messages
- Deduplication prevents re-insertion
</verification>

<success_criteria>
- Slack ingestion working end-to-end: channel messages -> AI parsing -> Supabase
- Reuses shared AI parser from Phase 03
- Incremental fetching supported (only new messages)
</success_criteria>

<output>
After completion, create `.planning/phases/04-slack-ingestion/01-SUMMARY.md`
</output>
