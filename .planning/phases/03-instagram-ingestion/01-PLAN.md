---
phase: 03-instagram-ingestion
plan: 01
type: execute
wave: 1
depends_on: []
files_modified: [src/lib/ingestion/instagram.ts, src/lib/ingestion/types.ts]
autonomous: true

must_haves:
  truths:
    - Instagram posts can be fetched from specific accounts via RapidAPI
    - Raw post data is returned in a structured format
  artifacts:
    - src/lib/ingestion/instagram.ts (RapidAPI client)
    - src/lib/ingestion/types.ts (raw ingestion types)
  key_links:
    - RapidAPI key -> API calls (if missing/invalid, fetches fail)
    - Account usernames -> API endpoint params (wrong format = no results)
---

<objective>
Build the Instagram data fetcher using RapidAPI's instagram120 endpoint.

Purpose: Retrieve raw Instagram posts from specified event promoter accounts in Gran Canaria.
Output: Instagram fetcher module that returns raw post data (caption, images, timestamp, permalink).
</objective>

<execution_context>
@.claude/skills/gsd/workflows/execute-plan/SKILL.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@.mcp.json
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Instagram fetcher via RapidAPI</name>
  <files>
    src/lib/ingestion/types.ts
    src/lib/ingestion/instagram.ts
  </files>
  <action>
    1. Create `src/lib/ingestion/types.ts` with:
       - `RawInstagramPost` interface (id, caption, image_url, permalink, timestamp, username)
       - `RawEvent` interface (common shape for all sources before DB insert: title, description, date_start, time, location, category, image_url, source, source_url)

    2. Create `src/lib/ingestion/instagram.ts` with:
       - `fetchAccountPosts(username: string, count?: number): Promise<RawInstagramPost[]>`
         Uses RapidAPI instagram120 endpoint. Reads API key from env var RAPIDAPI_KEY.
         Fetches recent posts from a given account.
       - Handle rate limits and errors gracefully (log and return empty array).
       - Add RAPIDAPI_KEY to .env.local.example.
  </action>
  <verify>
    - `npx tsc --noEmit` passes
    - Module exports are correct
  </verify>
  <done>
    - Instagram fetcher can retrieve posts from a given username
    - Raw post type captures all needed fields
    - RawEvent type defined as common ingestion format
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles
- Fetcher handles API errors without crashing
</verification>

<success_criteria>
- Instagram posts retrievable via RapidAPI
- Raw data types defined for the ingestion pipeline
</success_criteria>

<output>
After completion, create `.planning/phases/03-instagram-ingestion/01-SUMMARY.md`
</output>
