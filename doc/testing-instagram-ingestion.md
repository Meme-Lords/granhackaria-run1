# Testing Instagram event sourcing with Anthropic parsing

The flow: **Instagram posts** (via RAPIDAPI) → **Anthropic/Claude** parses captions into event JSON → **Supabase** stores events.

## 1. Unit tests (mocked APIs)

Runs the pipeline and parser with mocked Instagram + Anthropic; no real API keys needed.

```bash
npm run test
```

Relevant tests:

- `src/lib/ingestion/__tests__/instagram-pipeline.test.ts` – full pipeline (fetch → parse → upsert) with mocks
- `src/lib/ingestion/__tests__/parser.test.ts` – Anthropic parsing (event extraction, `not_event`, errors)
- `src/lib/ingestion/__tests__/instagram.test.ts` – Instagram fetch (RAPIDAPI) with mocks

## 2. Manual run (real APIs)

Runs the Instagram pipeline against real Instagram + Anthropic + Supabase. Use this to validate end-to-end with real accounts and parsing.

### Env vars (in `.env` or `.env.local`)

| Variable | Purpose |
|----------|--------|
| `INSTAGRAM_ACCOUNTS` | Comma-separated usernames, e.g. `account1,account2` |
| `RAPIDAPI_KEY` | Key for [Instagram Scraper API](https://rapidapi.com/social-starter-api-social-starter-api-default/api/instagram-scraper-api2) (or the host used in `instagram.ts`) |
| `OPENAI_API_KEY` or `ANTHROPIC_API_KEY` | One of these (OpenAI preferred if both set): OpenAI for GPT-4o-mini, Anthropic for Claude (caption → event JSON) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role (for inserting events) |

### Run the pipeline

```bash
npx tsx src/lib/ingestion/instagram-pipeline.ts
```

Or add a script to `package.json` and run:

```bash
npm run ingest:instagram
```

You should see logs per account (posts fetched, parsed, inserted/skipped/errors) and a final summary.

### What to check

- Posts are fetched for each account (no “RAPIDAPI_KEY is not set” or API errors).
- Captions are sent to Claude; events are extracted (or “not an event” when appropriate).
- Inserted events show up in Supabase Table Editor under `events` (filter by `source = 'instagram'`).

## 3. Via cron API (Instagram + Slack together)

The app’s cron endpoint runs both Instagram and Slack pipelines:

```bash
# If CRON_SECRET is set (e.g. in .env):
curl -H "Authorization: Bearer YOUR_CRON_SECRET" "http://localhost:3000/api/cron/ingest"

# If CRON_SECRET is not set (e.g. local dev), no header needed:
curl "http://localhost:3000/api/cron/ingest"
```

Requires the dev server (`npm run dev`) and the same env vars as above (plus Slack vars if you care about Slack). Response JSON includes `instagram` and `slack` result counts.

## Quick checklist

- [ ] `npm run test` passes (mocked flow).
- [ ] `.env` has `INSTAGRAM_ACCOUNTS`, `RAPIDAPI_KEY`, `ANTHROPIC_API_KEY`, Supabase URL + secret key.
- [ ] `npx tsx src/lib/ingestion/instagram-pipeline.ts` runs without missing-env errors and prints inserted/skipped/errors.
- [ ] New rows in Supabase `events` with `source = 'instagram'` after a run.
