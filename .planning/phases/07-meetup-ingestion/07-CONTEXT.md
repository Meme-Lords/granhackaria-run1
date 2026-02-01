# Phase 07: Meetup Integration — CONTEXT

## Why Meetup?

Meetup.com is a major platform for community events and gatherings. Adding it as a third event source (alongside Instagram and Slack) will significantly expand EventosGC's event coverage by tapping into organized community groups, workshops, networking events, and recurring meetups.

## Meetup API Overview

**API Type:** GraphQL
**Endpoint:** `https://api.meetup.com/gql`
**Authentication:** OAuth2 Bearer token
**Rate Limit:** 500 points per 60 seconds
**Documentation:** https://www.meetup.com/api/guide/

### Key Capabilities

1. **eventsSearch Query:**
   - Filter by status (UPCOMING, PAST, CANCELLED)
   - Filter by location (lat, lon, radius in km)
   - Returns event details: title, description, dateTime, duration, venue, photos, RSVPs
   - Supports pagination via cursor-based pagination

2. **Event Data Available:**
   - Event metadata (id, title, description, eventUrl)
   - Date/time information (dateTime, duration, timezone)
   - Venue information (name, address, city, lat/lon)
   - Images (featuredEventPhoto with baseUrl)
   - Group information (host organization)
   - RSVP counts (going count)

3. **Location-Based Search:**
   - Uses latitude/longitude coordinates (not city names)
   - Supports radius filtering in kilometers
   - Gran Canaria coordinates: lat=27.9202, lon=-15.5474
   - Recommended radius: 50km to cover the island

### Authentication Flow

**OAuth2 Server Flow:**
1. Register app at Meetup Developer Platform
2. Get client_id and client_secret
3. User authorizes app (one-time browser flow)
4. Exchange authorization code for access_token + refresh_token
5. Store refresh_token securely (environment variable)
6. Use access_token in Authorization header
7. Refresh when expired using refresh_token

**Token Refresh:**
```
POST https://secure.meetup.com/oauth2/access
Content-Type: application/x-www-form-urlencoded

client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&grant_type=refresh_token
&refresh_token=YOUR_REFRESH_TOKEN
```

### Rate Limiting

- **Limit:** 500 points per 60-second window
- **Behavior:** API returns error when limit exceeded
- **Error Response:** Includes timestamp when limit resets
- **Mitigation Strategies:**
  - Fetch conservatively (50 events per cron run)
  - Implement exponential backoff on 429 errors
  - Track points consumed (if exposed in response headers)
  - Run cron job daily (existing schedule) to spread load

## Example GraphQL Query

```graphql
query GetGranCanariaEvents {
  eventsSearch(input: {
    first: 50,
    filter: {
      status: UPCOMING,
      lat: 27.9202,
      lon: -15.5474,
      radius: 50
    }
  }) {
    totalCount
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        title
        description
        dateTime
        duration
        eventUrl
        going
        featuredEventPhoto {
          id
          baseUrl
        }
        venue {
          id
          name
          address
          city
          state
          country
          lat
          lng
        }
        group {
          id
          name
          urlname
        }
        eventHosts {
          id
          name
        }
      }
    }
  }
}
```

## Data Mapping to RawEvent Schema

Our existing schema:
```typescript
interface RawEvent {
  title: string;
  description: string | null;
  date_start: string; // YYYY-MM-DD
  time: string | null; // HH:MM
  location: string;
  ticket_price: string | null;
  category: "music" | "arts" | "food" | "sports" | "festival" | "theater" | "workshop" | "market";
  image_url: string | null;
  source: "instagram" | "slack" | "manual" | "meetup";
  source_url: string | null;
}
```

**Mapping Strategy:**

| EventosGC Field | Meetup API Field | Transformation |
|----------------|------------------|----------------|
| title | title | Direct copy |
| description | description | Direct copy (may be HTML, strip tags?) |
| date_start | dateTime | Extract date part (YYYY-MM-DD) |
| time | dateTime | Extract time part (HH:MM), handle timezone |
| location | venue.name + venue.address + venue.city | Concatenate, fallback to "Online" if no venue |
| ticket_price | N/A | Set to null or "Free" (Meetup doesn't expose pricing) |
| category | Derive from group.name or description | Use AI parser or keyword mapping |
| image_url | featuredEventPhoto.baseUrl | Direct copy, null if missing |
| source | "meetup" | Hardcoded |
| source_url | eventUrl | Direct copy |

## Category Mapping Strategy

Meetup doesn't have a standard category taxonomy that matches EventosGC's categories. Two approaches:

### Option A: AI-Based Classification (Recommended)
- Use existing `parseEventFromText()` function
- Pass title + description + group name
- Let Claude classify into one of 8 categories
- Pros: Accurate, handles edge cases, already implemented
- Cons: API cost per event (minimal given daily cron)

### Option B: Keyword Mapping
- Map common Meetup group keywords to categories
- Example rules:
  - "music", "concert", "DJ" → music
  - "art", "gallery", "exhibition" → arts
  - "food", "cooking", "restaurant" → food
  - "sport", "fitness", "running" → sports
  - "workshop", "learning", "class" → workshop
  - "market", "fair", "bazaar" → market
- Fallback to "workshop" for unmapped events
- Pros: Fast, no API cost
- Cons: Less accurate, requires maintenance

**Recommendation:** Start with Option A (AI-based), add keyword mapping as fallback if AI fails.

## Existing Pipeline Pattern

All ingestion pipelines follow the same structure:

1. **Fetch:** Get raw data from source API
   - `fetchAccountPosts()` for Instagram
   - `fetchSlackMessages()` for Slack
   - `fetchMeetupEvents()` for Meetup (to be created)

2. **Parse/Transform:** Convert to RawEvent format
   - Instagram: `parseEventFromText()` + `parseEventFromImage()`
   - Slack: `parseEventFromText()`
   - Meetup: `transformMeetupEvent()` + optional AI classification

3. **Upsert:** Insert into Supabase
   - Shared `upsertEvent()` function
   - Unique constraint on (source, title, date_start)
   - Returns "inserted" | "skipped" | "error"

4. **Track Results:** Count inserted/skipped/errors
   - Return `PipelineResult { inserted, skipped, errors }`

5. **Error Handling:** Try/catch with logging
   - Individual event failures don't crash pipeline
   - Log errors but continue processing

## Files to Create

```
src/lib/meetup/
├── auth.ts                    # OAuth2 helpers
└── __tests__/
    └── auth.test.ts

src/lib/ingestion/
├── meetup.ts                  # Fetcher + transformer
├── meetup-pipeline.ts         # Pipeline orchestration
└── __tests__/
    ├── meetup.test.ts
    └── meetup-pipeline.test.ts
```

## Environment Variables

Add to `.env.local` and `.env.example`:

```bash
# Meetup API (OAuth2)
MEETUP_CLIENT_ID=your_client_id_here
MEETUP_CLIENT_SECRET=your_client_secret_here
MEETUP_REFRESH_TOKEN=your_refresh_token_here
```

## Testing Strategy

Follow existing test patterns:

1. **Unit Tests:**
   - Auth helpers (token exchange, refresh)
   - Data transformation (Meetup → RawEvent)
   - Category mapping logic

2. **Integration Tests:**
   - Fetcher with mocked GraphQL responses
   - Pipeline with mocked Supabase

3. **Error Scenarios:**
   - 401 Unauthorized (expired token → refresh)
   - 429 Rate Limit (backoff and retry)
   - Network errors (timeout, connection)
   - Invalid event data (missing required fields)

4. **Edge Cases:**
   - Online events (no venue)
   - Missing images
   - Missing descriptions
   - Timezone conversions

**Target Coverage:** Match existing pipelines (~15-20 tests, >90% coverage)

## Implementation Order

1. **Plan 01:** Research + OAuth2 setup (get credentials, test auth)
2. **Plan 02:** GraphQL client + fetcher (query events)
3. **Plan 03:** Data transformation + category mapping
4. **Plan 04:** Pipeline orchestration (end-to-end)
5. **Plan 05:** Cron integration (add to existing job)
6. **Plan 06:** Testing + documentation

**Parallel Opportunities:**
- Plans 01-02 can run in parallel (auth setup + GraphQL research)
- Plan 06 tests can be written alongside Plans 02-04

## References

- [Meetup API Guide](https://www.meetup.com/api/guide/)
- [Meetup GraphQL Playground](https://www.meetup.com/api/playground/)
- [OAuth2 Documentation](https://www.meetup.com/api/authentication/)
- [GraphQL Schema Reference](https://www.meetup.com/graphql/schema/)

## Open Questions

1. **Token Storage:** Should we move refresh_token to Supabase secrets table for better security? (Future enhancement)
2. **Group Filtering:** Should we filter by specific Meetup groups (e.g., only Gran Canaria tech/expat communities)? (Phase 2)
3. **Pagination:** Should we paginate beyond first 50 events, or is 50 sufficient for daily cron? (Monitor after launch)
4. **Pricing:** How to handle paid events since Meetup doesn't expose ticket prices in API? (Accept null, add manual override later)
5. **Recurring Events:** How does Meetup represent recurring events? One event vs. multiple instances? (Test during implementation)
