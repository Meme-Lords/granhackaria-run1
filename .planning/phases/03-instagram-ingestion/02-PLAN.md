---
phase: 03-instagram-ingestion
plan: 02
type: execute
wave: 2
depends_on: [01]
files_modified: [src/lib/ingestion/parser.ts, src/lib/ingestion/instagram-pipeline.ts]
autonomous: false
user_setup:
  - service: anthropic
    why: "AI-assisted event parsing from Instagram captions"
    env_vars:
      - name: ANTHROPIC_API_KEY
        source: "https://console.anthropic.com -> API Keys"

must_haves:
  truths:
    - Instagram captions can be parsed into structured event data (title, date, time, location, category)
    - Parsed events are inserted into Supabase without duplicates
    - AI parsing handles varied caption formats (formal, casual, emoji-heavy)
  artifacts:
    - src/lib/ingestion/parser.ts (AI-assisted caption parser)
    - src/lib/ingestion/instagram-pipeline.ts (fetch -> parse -> store pipeline)
  key_links:
    - Caption text -> LLM parsing -> structured RawEvent (if parsing fails, no event created)
    - source_url uniqueness -> deduplication (if missing, duplicates accumulate)
---

<objective>
Build the AI-assisted parser and full Instagram ingestion pipeline (fetch -> parse -> store).

Purpose: Transform raw Instagram captions into structured events and save them to Supabase.
Output: LLM-powered parser, end-to-end ingestion pipeline, runnable as a script.
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@src/lib/ingestion/types.ts
@src/lib/ingestion/instagram.ts
@src/types/event.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create AI-assisted event parser</name>
  <files>
    src/lib/ingestion/parser.ts
  </files>
  <action>
    Create parser that uses Claude API (Anthropic SDK) to extract structured event data from raw text.

    1. Install @anthropic-ai/sdk if not present
    2. `parseEventFromText(text: string, source: string): Promise<RawEvent | null>`
       - Sends caption to Claude with a system prompt instructing it to extract: title, description, date_start (ISO), time (HH:MM), location, category (one of the 8 CategoryVariant values)
       - Returns null if the text doesn't appear to be about an event
       - Use claude-sonnet-4-20250514 (haiku for cost efficiency in production)
    3. Handle parsing failures gracefully (log warning, return null)
    4. Add ANTHROPIC_API_KEY to .env.local.example
  </action>
  <verify>
    - `npx tsc --noEmit` passes
  </verify>
  <done>
    - Parser extracts structured event data from freeform text
    - Non-event posts return null (filtered out)
    - Categories constrained to valid CategoryVariant values
  </done>
</task>

<task type="auto">
  <name>Task 2: Create Instagram ingestion pipeline</name>
  <files>
    src/lib/ingestion/instagram-pipeline.ts
  </files>
  <action>
    Create end-to-end pipeline:

    1. `ingestFromInstagram(accounts: string[]): Promise<{inserted: number, skipped: number, errors: number}>`
       - For each account: fetch recent posts
       - For each post: parse caption with AI parser
       - For each parsed event: upsert into Supabase (ON CONFLICT source_url DO NOTHING)
       - Track and return counts
    2. Make it runnable as a script: `npx tsx src/lib/ingestion/instagram-pipeline.ts`
       - When run directly, read accounts from env var INSTAGRAM_ACCOUNTS (comma-separated)
       - Log progress and results
    3. Add INSTAGRAM_ACCOUNTS to .env.local.example
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - Script is runnable (with valid env vars)
  </verify>
  <done>
    - Pipeline fetches, parses, and stores Instagram events
    - Deduplication via source_url prevents re-insertion
    - Runnable as standalone script with clear output
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles
- Pipeline can be run manually and produces events in Supabase
- Duplicate runs don't create duplicate events
</verification>

<success_criteria>
- End-to-end Instagram ingestion working: account posts -> AI parsing -> Supabase
- Non-event posts filtered out
- Deduplication working
</success_criteria>

<output>
After completion, create `.planning/phases/03-instagram-ingestion/02-SUMMARY.md`
</output>
