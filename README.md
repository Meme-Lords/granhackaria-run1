# granhackaria-run1

**Stack:** Next.js · TypeScript · Supabase

## Setup

1. Clone and install:
   ```bash
   git clone https://github.com/Meme-Lords/granhackaria-run1.git
   cd granhackaria-run1
   npm install
   ```
2. Copy env and add your Supabase keys:
   ```bash
   cp .env.example .env
   ```
   Fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from [Supabase](https://supabase.com/dashboard) → Project → Settings → API.

   If `.env.example` is missing, create it with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
3. Run dev server (after Phase 01 creates the app):
   ```bash
   npm run dev
   ```

## Running phases (Ralphy)

- **PowerShell:** `.\run-ralphy-all-phases.ps1`
- **Bash:** `./run-ralphy-all-phases.sh`
- Or: `ralphy --yaml .ralphy/tasks.yaml --max-iterations 0 --max-retries 3 --verbose`

Phase plans live in `.planning/phases/`. GSD skills are in `.agents/skills/gsd/`.

## Meetup ingestion (Phase 07)

Meetup events for Gran Canaria can be ingested in two ways:

1. **OAuth + GraphQL (Meetup API)** — Register an OAuth app at [Meetup API](https://www.meetup.com/api/oauth/) and set:
   - `MEETUP_CLIENT_ID` — OAuth client ID
   - `MEETUP_CLIENT_SECRET` — OAuth client secret
   - `MEETUP_REFRESH_TOKEN` — Long-lived refresh token (obtained once via OAuth2 authorization code flow)

2. **Apify (no Meetup account)** — Set `APIFY_API_TOKEN` ([Apify Console](https://console.apify.com/account/integrations)). Choose Actor via `MEETUP_APIFY_ACTOR`:
   - **`event-scraper-pro`** (default) — [Event Scraper Pro](https://apify.com/webdatalabs/event-scraper-pro): Meetup + Eventbrite + Lu.ma, cover images. Optional: `MEETUP_APIFY_CITY`, `MEETUP_APIFY_COUNTRY`, `MEETUP_APIFY_MAX_RESULTS`, `MEETUP_APIFY_KEYWORDS`, `MEETUP_APIFY_PLATFORMS`.
   - **`meetup-scraper`** — [filip_cicvarek/meetup-scraper](https://apify.com/filip_cicvarek/meetup-scraper): Meetup only, no images. Same optional env for city, country, keywords, max results.

The pipeline uses OAuth when those credentials are set; otherwise it uses the chosen Apify Actor when `APIFY_API_TOKEN` is set.

Run Meetup ingestion standalone: `npm run ingest:meetup` or `npx tsx src/lib/ingestion/meetup-pipeline.ts`
