# Roadmap: EventosGC

## Phase Structure

---

## Phase 01: Supabase Schema & Client Setup

**Goal:** Set up the Supabase database schema and connect it to the Next.js app.

**Deliverables:**
- Events table in Supabase (title, description, date_start, date_end, time, location, category, image_url, source, source_url, created_at)
- Supabase client configured in Next.js (using @supabase/ssr)
- Seed data matching current hardcoded events for testing
- Environment variables (.env.local) for Supabase URL and anon key

**Success Criteria:**
- Can insert and query events from Supabase
- Seed data visible in Supabase dashboard
- Supabase client importable in Next.js server/client components

**Requirements:** REQ-06, REQ-07, REQ-08, REQ-NF-03

---

## Phase 02: Wire Frontend to Supabase

**Goal:** Replace hardcoded event data with live Supabase queries.

**Deliverables:**
- Server-side data fetching in page.tsx (today, tomorrow, this week queries)
- EventCard props populated from database rows
- Date-based grouping logic (today/tomorrow/this week)

**Success Criteria:**
- Homepage shows events from Supabase instead of hardcoded arrays
- Adding an event to Supabase makes it appear on the page after refresh
- Events grouped correctly by date

**Requirements:** REQ-09, REQ-10, REQ-11, REQ-NF-02

---

## Phase 03: Instagram Ingestion

**Goal:** Scrape Instagram for event posts and store them in Supabase.

**Deliverables:**
- Instagram scraper using RapidAPI (instagram120 endpoint)
- Event data extraction from Instagram posts (caption parsing for title, date, location)
- Category auto-detection from post content
- Ingestion script or Supabase Edge Function
- Deduplication logic (by source_url)

**Success Criteria:**
- Running the ingestion creates new events in Supabase from Instagram posts
- Extracted events have correct title, date, location, and category
- Duplicate posts are not re-inserted

**Requirements:** REQ-01, REQ-03, REQ-04, REQ-05

---

## Phase 04: Slack Ingestion

**Goal:** Pull events from a specific Slack workspace channel into Supabase.

**Deliverables:**
- Slack API integration (Bot token or webhook)
- Message parsing to extract event data
- Category auto-detection from message content
- Ingestion mechanism (webhook listener or polling)
- Deduplication logic (by source message ID)

**Success Criteria:**
- Events posted in the Slack channel appear in Supabase
- Extracted events have correct structured data
- Duplicate messages are not re-inserted

**Requirements:** REQ-02, REQ-03, REQ-04, REQ-05, REQ-NF-01

---

## Phase 05: Scheduling & Automation

**Goal:** Automate ingestion so events flow in without manual runs.

**Deliverables:**
- Scheduled Instagram scraping (cron job or Supabase Edge Function on a timer)
- Slack ingestion running continuously or on short polling interval
- Error handling and logging for failed ingestions
- Basic monitoring (log when ingestion runs, how many events found)

**Success Criteria:**
- Instagram events appear automatically on schedule
- Slack events appear within 15 minutes of posting
- Failed ingestions don't crash the system, errors are logged

**Requirements:** REQ-13, REQ-14, REQ-NF-01

---

## Phase 06: Polish & Deploy

**Goal:** Production-ready deployment with final UI polish.

**Deliverables:**
- "View all" pages per section/category
- Loading states and empty states
- Error handling in the frontend
- Responsive design (mobile-friendly)
- Deployment (Vercel or similar)
- Environment configuration for production

**Success Criteria:**
- App deployed and accessible publicly
- Works on mobile and desktop
- Handles empty event lists gracefully
- All event sources flowing into production
- REQ-12 implemented

**Requirements:** REQ-12, REQ-NF-02

---

## Phase 07: Meetup Integration

**Goal:** Add Meetup.com as a third event source for community events.

**Deliverables:**
- OAuth2 authentication with Meetup API
- GraphQL client for Meetup eventsSearch query
- Location-based filtering for Gran Canaria (lat/lon)
- Event data transformation to RawEvent format
- Category mapping from Meetup to EventosGC categories
- Meetup ingestion pipeline (meetup-pipeline.ts)
- Integration into cron job at /api/cron/ingest
- Rate limiting handling (500 points/60s)
- Test coverage matching existing pipelines

**Success Criteria:**
- Meetup events appear in Supabase with source="meetup"
- Events are from Gran Canaria area (50km radius)
- Category mapping is accurate
- Duplicates are prevented via source_url
- Pipeline runs successfully in cron job
- Rate limits are handled gracefully
- Test coverage >90% for new code

**Requirements:** Extends REQ-01 (additional event source)
