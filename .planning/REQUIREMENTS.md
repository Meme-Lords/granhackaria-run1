# Requirements: EventosGC

## Functional

### Data Ingestion
- REQ-01: Scrape event-related posts from Instagram via RapidAPI (hashtags and/or specific accounts)
- REQ-02: Ingest event messages from a specific Slack workspace channel
- REQ-03: Extract structured event data (title, date/time, location, description, category, image URL, source link) from raw posts
- REQ-04: Deduplicate events across sources
- REQ-05: Auto-categorize events into existing categories (music, arts, food, sports, festival, theater, workshop, market)

### Storage
- REQ-06: Store normalized events in Supabase Postgres with proper schema
- REQ-07: Support querying events by date range (today, tomorrow, this week)
- REQ-08: Support filtering events by category

### Frontend
- REQ-09: Replace hardcoded event data with Supabase queries
- REQ-10: Display events grouped by Today / Tomorrow / This Week
- REQ-11: Show event cards with image, category badge, time, title, and location
- REQ-12: "View all" links per section for expanded listings

### Ingestion Scheduling
- REQ-13: Run Instagram ingestion on a regular schedule (cron or Supabase Edge Function)
- REQ-14: Receive Slack events in near-real-time (webhook or polling)

## Non-Functional

- REQ-NF-01: Events should appear in the app within 15 minutes of source posting (Slack) or next scheduled scrape (Instagram)
- REQ-NF-02: App should load event listings in under 2 seconds
- REQ-NF-03: Supabase schema should be extensible for future sources (websites, user submissions)
- REQ-NF-04: No user authentication required for browsing
