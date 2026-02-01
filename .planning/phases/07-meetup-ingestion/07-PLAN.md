# Phase 07: Meetup Integration — PLAN

## Goal

Add Meetup.com as a third event source, enabling the app to automatically discover and ingest community events from the Meetup platform for the Gran Canaria area.

## Success Criteria (Goal-Backward)

**What must be TRUE:**
1. Events from Meetup appear in the events table with correct data (title, date, time, location, category, image, source="meetup")
2. The cron job successfully fetches events from Meetup GraphQL API on schedule
3. Meetup events are deduplicated by source_url (eventUrl)
4. Location filtering works correctly for Gran Canaria (lat/lon based)
5. OAuth2 token is obtained and refreshed automatically
6. Rate limiting (500 points/60s) is handled gracefully
7. Category mapping from Meetup categories to EventosGC categories works accurately
8. Pipeline has test coverage matching existing pipelines (Instagram/Slack pattern)

## Context

**What exists:**
- Two working ingestion pipelines: Instagram (via RapidAPI) and Slack (via @slack/web-api)
- Shared AI parser (`src/lib/ingestion/parser.ts`) for text-based event extraction
- Cron job at `/api/cron/ingest` that runs both pipelines
- Event schema supporting all needed fields (source field supports "instagram" | "slack" | "manual")
- Supabase upsert logic with deduplication via unique constraint

**Meetup API specifics:**
- GraphQL API at `https://api.meetup.com/gql`
- Requires OAuth2 Bearer token in Authorization header
- Rate limit: 500 points per 60 seconds
- Location search uses lat/lon coordinates (not city names)
- Returns: title, description, dateTime, duration, eventUrl, venue, featuredEventPhoto, group info

**Gran Canaria coordinates:**
- Latitude: 27.9202
- Longitude: -15.5474
- Search radius: ~50km to cover the island

## Research Questions

Before implementation, we need to answer:

1. **OAuth2 Setup:**
   - How to register app and obtain initial credentials?
   - What's the token refresh flow?
   - Where to store refresh_token securely (env var vs Supabase)?

2. **GraphQL Query Structure:**
   - What's the exact eventsSearch query syntax?
   - What filters are available (status, date range, radius)?
   - How many points does a typical query cost?
   - Is there pagination? What's the page size limit?

3. **Category Mapping:**
   - What categories/topics does Meetup return?
   - How to map to our 8 categories: music, arts, food, sports, festival, theater, workshop, market?
   - Should we use AI parser for category classification or direct mapping?

4. **Data Transformation:**
   - How is pricing/ticketing represented in Meetup API?
   - How to extract image URLs from featuredEventPhoto?
   - How to handle hybrid events (online + venue)?
   - Date/time format and timezone handling?

5. **Rate Limiting Strategy:**
   - How many events can we fetch per cron run without hitting limits?
   - Should we implement exponential backoff?
   - Do we need request queuing?

## Plans

### Plan 01: Research & OAuth Setup

**Goal:** Understand Meetup API structure and obtain working OAuth2 credentials.

**Tasks:**
1. Register app at Meetup Developer Platform (meetup.com/api)
2. Document OAuth2 flow (authorization code grant)
3. Implement token exchange function (code → access_token + refresh_token)
4. Implement token refresh function (refresh_token → new access_token)
5. Store MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN in .env.local
6. Create test script to verify token works (query { self { id name } })

**Verification:**
- [ ] Can successfully authenticate and get access token
- [ ] Can refresh token when expired
- [ ] Test query returns user info without errors

**Files:**
- `src/lib/meetup/auth.ts` — OAuth2 helpers (getAccessToken, refreshToken)
- `src/lib/meetup/__tests__/auth.test.ts` — Auth tests

---

### Plan 02: GraphQL Client & Event Fetcher

**Goal:** Create a Meetup GraphQL client that fetches upcoming events for Gran Canaria.

**Tasks:**
1. Install graphql-request or use fetch directly for GraphQL queries
2. Create Meetup client with authentication headers
3. Define eventsSearch query with filters:
   - status: UPCOMING
   - lat/lon: 27.9202, -15.5474
   - radius: 50km
   - first: 50 (pagination size)
4. Implement fetchMeetupEvents() returning RawMeetupEvent[]
5. Add error handling for rate limits (429), auth errors (401), network issues
6. Add request retry logic with exponential backoff
7. Log rate limit consumption (points used/remaining if available in headers)

**Verification:**
- [ ] fetchMeetupEvents() returns array of event objects
- [ ] Events are from Gran Canaria area
- [ ] Rate limit errors are caught and handled gracefully
- [ ] Auth errors trigger token refresh

**Files:**
- `src/lib/ingestion/meetup.ts` — Meetup fetcher
- `src/lib/ingestion/__tests__/meetup.test.ts` — Fetcher tests

**API Example Query:**
```graphql
query {
  eventsSearch(input: {
    first: 50,
    filter: {
      status: UPCOMING,
      lat: 27.9202,
      lon: -15.5474,
      radius: 50
    }
  }) {
    edges {
      node {
        id
        title
        description
        dateTime
        duration
        eventUrl
        featuredEventPhoto {
          baseUrl
        }
        venue {
          name
          address
          city
        }
        group {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

### Plan 03: Data Transformation & Category Mapping

**Goal:** Transform Meetup event data into RawEvent format matching our schema.

**Tasks:**
1. Define RawMeetupEvent interface (Meetup API response shape)
2. Create transformMeetupEvent(meetupEvent) → RawEvent function
3. Extract date_start from dateTime (convert to YYYY-MM-DD)
4. Extract time from dateTime (convert to HH:MM)
5. Build location string from venue (name, address, city)
6. Map image_url from featuredEventPhoto.baseUrl
7. Set source = "meetup", source_url = eventUrl
8. Implement category mapping logic:
   - Option A: Use AI parser (parseEventFromText) to classify
   - Option B: Keyword-based mapping from Meetup group name/description
9. Handle edge cases:
   - Missing venue (online events) → location = "Online"
   - Missing image → image_url = null
   - Missing description → description = null
   - Pricing data extraction (if available)

**Verification:**
- [ ] Meetup events transform correctly to RawEvent format
- [ ] Categories map accurately (validate sample events)
- [ ] Date/time parsing handles timezones correctly
- [ ] Edge cases handled without errors

**Files:**
- `src/lib/ingestion/meetup.ts` — Add transform logic
- `src/lib/ingestion/__tests__/meetup.test.ts` — Add transform tests

---

### Plan 04: Meetup Ingestion Pipeline

**Goal:** Create end-to-end pipeline matching Instagram/Slack pattern.

**Tasks:**
1. Create ingestFromMeetup() function following existing pipeline pattern
2. Call fetchMeetupEvents() to get raw data
3. Transform each event to RawEvent format
4. Upsert each event to Supabase using existing upsertEvent() logic
5. Track inserted/skipped/errors counts
6. Add comprehensive logging matching existing pipelines
7. Handle duplicate events (unique constraint on source + title + date_start)
8. Create standalone test script for local testing
9. Add environment variable checks (MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN)

**Verification:**
- [ ] Pipeline runs successfully end-to-end
- [ ] Events appear in Supabase with source="meetup"
- [ ] Duplicates are skipped correctly
- [ ] Errors are logged but don't crash pipeline
- [ ] Can run standalone: npx tsx src/lib/ingestion/meetup-pipeline.ts

**Files:**
- `src/lib/ingestion/meetup-pipeline.ts` — Pipeline implementation
- `src/lib/ingestion/__tests__/meetup-pipeline.test.ts` — Pipeline tests

**Success Metrics:**
```typescript
interface PipelineResult {
  inserted: number;  // New events added
  skipped: number;   // Duplicates or invalid events
  errors: number;    // Failed insertions
}
```

---

### Plan 05: Update Types & Cron Integration

**Goal:** Integrate Meetup pipeline into the existing cron job.

**Tasks:**
1. Update RawEvent source type: "instagram" | "slack" | "manual" → add "meetup"
2. Import ingestFromMeetup in `/api/cron/ingest/route.ts`
3. Add Meetup execution block following Instagram/Slack pattern:
   ```typescript
   let meetup: PipelineResult | { error: string } = { error: "not run" };
   try {
     meetup = await ingestFromMeetup();
     console.log("[cron/ingest] Meetup result:", meetup);
   } catch (err) {
     meetup = { error: message };
   }
   ```
4. Add meetup results to response JSON
5. Update cron tests to include Meetup pipeline
6. Add conditional execution (skip if env vars not configured)
7. Document required env vars in README

**Verification:**
- [ ] Cron job runs all three pipelines (Instagram, Slack, Meetup)
- [ ] Each pipeline runs independently (failures don't affect others)
- [ ] Response JSON includes meetup results
- [ ] Tests pass for updated cron route
- [ ] Can run cron locally with all env vars set

**Files:**
- `src/lib/ingestion/types.ts` — Update source type
- `src/app/api/cron/ingest/route.ts` — Add Meetup integration
- `src/app/api/cron/ingest/__tests__/route.test.ts` — Update tests
- `README.md` — Document Meetup env vars

---

### Plan 06: Testing & Documentation

**Goal:** Ensure test coverage and document Meetup integration.

**Tasks:**
1. Add unit tests for auth helpers (token exchange, refresh)
2. Add unit tests for Meetup fetcher (with mocked API responses)
3. Add unit tests for data transformation
4. Add integration tests for pipeline (with mocked Supabase)
5. Test rate limiting behavior (mock 429 responses)
6. Test OAuth2 refresh flow (mock expired token)
7. Update PROJECT.md to mention Meetup as third source
8. Update STATE.md with Phase 07 completion
9. Update ROADMAP.md if needed
10. Create env.example with Meetup variables

**Verification:**
- [ ] Test coverage matches Instagram/Slack pipelines (~15-20 tests)
- [ ] All tests pass: npm test
- [ ] Documentation updated
- [ ] env.example has Meetup credentials template

**Files:**
- All test files created in previous plans
- `.planning/phases/07-meetup-ingestion/07-SUMMARY.md` — Phase summary
- `.env.example` — Add Meetup env vars
- `.planning/PROJECT.md` — Update vision/solution
- `.planning/STATE.md` — Mark Phase 07 complete

---

## Dependencies

**Blocks:**
- None (Phase 05 completed, infrastructure ready)

**Blocked By:**
- None (can start immediately)

**External Dependencies:**
- Meetup Developer Account (free)
- OAuth2 app registration
- Access to Meetup GraphQL API

## Risk Assessment

**High Risk:**
- OAuth2 flow complexity (mitigation: test thoroughly with refresh flow)
- Rate limiting could block ingestion (mitigation: conservative fetch size, backoff logic)

**Medium Risk:**
- Category mapping accuracy (mitigation: use AI parser as fallback)
- Timezone handling for events (mitigation: use ISO datetime parsing)

**Low Risk:**
- API schema changes (mitigation: GraphQL introspection, version in comments)

## Estimated Complexity

- **Auth Setup:** Medium (OAuth2 boilerplate, one-time)
- **GraphQL Client:** Low (straightforward query)
- **Data Transform:** Medium (category mapping, edge cases)
- **Pipeline Integration:** Low (follow existing pattern)
- **Testing:** Medium (auth mocking, rate limit scenarios)

**Overall:** Medium complexity, 6 plans, ~50-80% of Instagram pipeline effort (no AI parsing for images).

## Notes

- Follow existing pipeline patterns exactly (Instagram/Slack as reference)
- Reuse shared types and upsert logic where possible
- Keep OAuth2 tokens in environment variables initially (can move to Supabase secrets later)
- Start with conservative rate limits (50 events per run) to avoid hitting 500 points/min
- Consider adding Meetup group URL filtering later (phase 2) to focus on specific communities
- Meetup API is read-only for public events, no write permissions needed
