# Phase 04: Slack Ingestion — Summary

## What Was Done

### Task 1: Create Slack fetcher and ingestion pipeline

1. **Installed `@slack/web-api`** as a dependency for Slack API access.

2. **Created `src/lib/ingestion/slack.ts`** — Slack channel message fetcher:
   - `fetchChannelMessages(channelId, since?)` fetches messages from a Slack channel
   - Uses `conversations.history` API with `SLACK_BOT_TOKEN`
   - Filters out bot messages, system messages (joins/leaves), and empty messages
   - Retrieves permalink for each message via `chat.getPermalink`
   - Supports `since` parameter for incremental fetches (only new messages)
   - Exports `SlackMessage` type (ts, text, user, permalink)

3. **Created `src/lib/ingestion/slack-pipeline.ts`** — end-to-end pipeline:
   - `ingestFromSlack(since?)` fetches messages, parses with AI, upserts to Supabase
   - Reuses `parseEventFromText` from Phase 03 parser
   - Upserts events with `source='slack'` and `source_url=permalink`
   - Deduplication via `source_url` conflict handling
   - Runnable as standalone script: `npx tsx src/lib/ingestion/slack-pipeline.ts`
   - Supports `--since=YYYY-MM-DD` CLI flag for incremental fetches

4. **Updated `.env.example`** with `SLACK_BOT_TOKEN` and `SLACK_CHANNEL_ID`.

5. **Created tests** (13 new tests across 2 files):
   - `__tests__/slack.test.ts` — 7 tests covering message fetching, filtering, error handling
   - `__tests__/slack-pipeline.test.ts` — 6 tests covering pipeline processing, skipping, errors

## Verification

- `npx tsc --noEmit` passes (no type errors)
- `npx vitest run` passes — 30 tests total (13 new + 17 existing)
- Pipeline is runnable as script with valid env vars

## Files Modified

- `src/lib/ingestion/slack.ts` (new)
- `src/lib/ingestion/slack-pipeline.ts` (new)
- `src/lib/ingestion/__tests__/slack.test.ts` (new)
- `src/lib/ingestion/__tests__/slack-pipeline.test.ts` (new)
- `.env.example` (updated with Slack env vars)
- `package.json` / `package-lock.json` (added @slack/web-api)

## Required Setup

Before running the pipeline, the user must:
1. Create a Slack App at https://api.slack.com/apps with `channels:history` and `channels:read` scopes
2. Install the app to the workspace
3. Set `SLACK_BOT_TOKEN` (Bot User OAuth Token) in `.env.local`
4. Set `SLACK_CHANNEL_ID` (target channel) in `.env.local`
