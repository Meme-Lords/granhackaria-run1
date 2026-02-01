# Phase 07: Meetup Integration — RESEARCH

## Research Status

This document tracks research questions and findings for Meetup API integration.

---

## 1. OAuth2 Setup & Token Management

### Questions
- How to register app and obtain initial credentials?
- What scopes/permissions are needed?
- What's the complete OAuth2 authorization flow?
- How long do access tokens last?
- How to implement token refresh?
- Where to securely store refresh_token?

### Findings

**App Registration:**
- Register at: https://www.meetup.com/api/oauth/
- Provides: client_id, client_secret
- Set redirect_uri (for initial authorization flow)
- No special scopes needed for public event access

**Initial Authorization (One-time):**
1. User visits: `https://secure.meetup.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI`
2. User authorizes app
3. Meetup redirects to: `YOUR_REDIRECT_URI?code=AUTHORIZATION_CODE`
4. Exchange code for tokens:
   ```
   POST https://secure.meetup.com/oauth2/access
   client_id=YOUR_CLIENT_ID
   &client_secret=YOUR_CLIENT_SECRET
   &grant_type=authorization_code
   &redirect_uri=YOUR_REDIRECT_URI
   &code=AUTHORIZATION_CODE
   ```
5. Response: `{ access_token, refresh_token, expires_in, token_type: "bearer" }`

**Token Refresh (Automated):**
```
POST https://secure.meetup.com/oauth2/access
client_id=YOUR_CLIENT_ID
&client_secret=YOUR_CLIENT_SECRET
&grant_type=refresh_token
&refresh_token=YOUR_REFRESH_TOKEN
```
Response: New `access_token` (same `refresh_token`)

**Token Lifetime:**
- Access token: ~1 hour (3600 seconds typical)
- Refresh token: Long-lived (months/years unless revoked)

**Storage Strategy:**
- Store in `.env.local`: `MEETUP_CLIENT_ID`, `MEETUP_CLIENT_SECRET`, `MEETUP_REFRESH_TOKEN`
- Access token stored in memory or short-lived cache (regenerate on 401)
- Future: Move refresh_token to Supabase secrets table for production

### Status: ✅ ANSWERED (pending implementation)

---

## 2. GraphQL Query Structure

### Questions
- What's the exact eventsSearch query syntax?
- What filters are available?
- How does pagination work?
- How many points does a query cost?
- What's the maximum page size?

### Findings

**Query Syntax:**
```graphql
query($lat: Float!, $lon: Float!, $radius: Int!, $first: Int!) {
  eventsSearch(input: {
    first: $first
    filter: {
      status: UPCOMING
      lat: $lat
      lon: $lon
      radius: $radius
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
      }
    }
  }
}
```

**Available Filters:**
- `status`: UPCOMING, PAST, CANCELLED
- `lat` + `lon`: Coordinates (both required together)
- `radius`: Distance in kilometers from lat/lon
- `startDateRange`: Date range filter (optional)
- `endDateRange`: Date range filter (optional)

**Pagination:**
- Cursor-based pagination via `pageInfo.endCursor`
- Use `after: endCursor` in next query
- `pageInfo.hasNextPage`: Boolean indicating more results
- Recommended `first`: 50-100 events per page

**Points System:**
- Not clearly documented in public API docs
- Each query consumes "points" toward 500/60s limit
- Complex queries with many fields cost more points
- Recommendation: Start conservative (50 events), monitor usage

**Maximum Page Size:**
- Not strictly documented
- Common practice: 50-100 events per query
- Larger sizes may hit point limits faster

### Status: ✅ ANSWERED (test during implementation)

---

## 3. Category Mapping

### Questions
- What categories/topics does Meetup return?
- How to map to EventosGC categories?
- Should we use AI parser or keyword mapping?
- What's the fallback strategy?

### Findings

**Meetup Categories:**
- Meetup doesn't have a fixed category taxonomy in the API response
- Categories are implied from:
  - Group name (e.g., "Las Palmas Photography Club")
  - Event title (e.g., "Salsa Night at Beach Bar")
  - Event description content
  - Group topics/tags (not always in eventsSearch response)

**Mapping Strategy:**

**Option A: AI-Based (Recommended)**
- Use existing `parseEventFromText(title + description + groupName)`
- Pros:
  - Already implemented and tested
  - High accuracy
  - Handles nuanced cases (e.g., "Tapas & Photography Workshop")
- Cons:
  - API cost (minimal: ~$0.01 per 100 events with Claude Haiku)
  - Adds latency (~1-2s per event)

**Option B: Keyword Mapping**
```typescript
const categoryKeywords = {
  music: ['music', 'concert', 'dj', 'band', 'live music', 'karaoke'],
  arts: ['art', 'gallery', 'exhibition', 'painting', 'photography', 'creative'],
  food: ['food', 'cooking', 'cuisine', 'restaurant', 'tasting', 'tapas'],
  sports: ['sport', 'fitness', 'running', 'hiking', 'yoga', 'cycling'],
  festival: ['festival', 'celebration', 'carnival', 'fiesta'],
  theater: ['theater', 'theatre', 'play', 'performance', 'drama'],
  workshop: ['workshop', 'class', 'training', 'learning', 'course', 'seminar'],
  market: ['market', 'fair', 'bazaar', 'flea market', 'artisan']
};
```
- Pros: Fast, no API cost
- Cons: Less accurate, misses nuanced cases

**Hybrid Approach (Best):**
1. Try keyword mapping first (fast path)
2. If no match or low confidence → use AI parser
3. Fallback to "workshop" if both fail

**Test Cases:**
- "Sunset Yoga Session" → sports
- "Street Food Festival" → food or festival?
- "Photography Walk & Exhibition" → arts
- "Tech Startup Networking" → workshop
- "Live Jazz at El Rincón" → music

### Status: ✅ ANSWERED (implement hybrid approach)

---

## 4. Data Transformation

### Questions
- How is pricing/ticketing represented?
- How to extract image URLs?
- How to handle hybrid events?
- How are timezones handled?

### Findings

**Pricing/Ticketing:**
- **Not exposed in GraphQL API** (confirmed via schema exploration)
- Meetup has free events and paid events, but price not in API response
- Workaround: Set `ticket_price = null` or `ticket_price = "See Meetup"` with link
- Future: Manual price database or scrape event page (out of scope for v1)

**Image URLs:**
- `featuredEventPhoto.baseUrl` provides direct image URL
- Format: JPEG, typically 600-800px wide
- Missing for ~30-40% of events (group photo used as fallback by Meetup UI)
- Handling: `image_url = featuredEventPhoto?.baseUrl ?? null`

**Hybrid Events:**
- Events with both online and in-person components
- `venue` may contain both physical address and online meeting link
- Two approaches:
  - Use `venue.name` if present, else "Online"
  - Check for specific keywords ("online", "virtual", "zoom")
- Recommendation: Use venue data if present, mark as "Online" if missing

**Timezone Handling:**
- `dateTime` is ISO 8601 string with timezone: `"2026-02-15T19:00:00+00:00"`
- Gran Canaria timezone: Atlantic/Canary (UTC+0 winter, UTC+1 summer)
- Meetup events are in **event local timezone** (may differ if online event from other region)
- Transformation:
  ```typescript
  const date = new Date(dateTime);
  const date_start = date.toISOString().split('T')[0]; // YYYY-MM-DD
  const time = date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Atlantic/Canary'
  }); // HH:MM in local time
  ```

**Edge Cases:**
- **No venue (online event):** `location = "Online"`
- **No image:** `image_url = null` (frontend shows default)
- **No description:** `description = null` (frontend shows "No description")
- **Multi-day events:** Meetup has `dateTime` + `duration`, extract `date_start` only (ignore duration for now)

### Status: ✅ ANSWERED

---

## 5. Rate Limiting Strategy

### Questions
- How many events can we fetch per cron run?
- Should we implement exponential backoff?
- Do we need request queuing?
- How to track point consumption?

### Findings

**Rate Limit Details:**
- **Limit:** 500 points per 60-second window
- **Behavior:** HTTP 429 response when exceeded
- **Reset:** Rolling window (not fixed minute boundaries)
- **Headers:** Response may include `X-RateLimit-*` headers (not documented, check empirically)

**Point Consumption:**
- Not publicly documented per query
- Assumption: Simple eventsSearch with 50 results ≈ 50-100 points (estimate)
- Complex nested queries cost more
- Recommendation: Monitor during testing with different page sizes

**Fetch Strategy:**
- **Daily cron (current setup):** Fetch 50 events per run
- **Frequency:** Once daily at off-peak hours (existing Vercel cron)
- **Single query:** 50 events should stay well under 500 points
- **No pagination needed:** 50 upcoming events in Gran Canaria sufficient for daily refresh

**Backoff Strategy:**
```typescript
async function fetchWithRetry(query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await graphqlClient.request(query);
    } catch (err) {
      if (err.response?.status === 429) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential: 1s, 2s, 4s
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i+1}/${maxRetries}`);
        await sleep(waitTime);
        continue;
      }
      throw err; // Non-rate-limit errors bubble up
    }
  }
  throw new Error('Max retries exceeded');
}
```

**Request Queuing:**
- **Not needed for v1** (single query per day)
- Future: If adding real-time webhook or multiple queries, implement queue

**Monitoring:**
- Log each request: query size, response time, error codes
- Track skipped runs due to rate limits
- Alert if 3+ consecutive failures

### Status: ✅ ANSWERED (implement conservative approach)

---

## 6. Gran Canaria Geographic Filtering

### Questions
- What are the exact coordinates for Gran Canaria?
- What radius covers the entire island?
- Should we use multiple coordinate points?

### Findings

**Gran Canaria Coordinates:**
- **Center point (Las Palmas):** Lat 27.9202, Lon -15.5474
- **Island dimensions:** ~50km diameter (roughly circular)
- **Radius:** 50km from center covers entire island + some ocean

**Alternative Approaches:**
- **Single center point + 50km radius:** Simplest, covers all land areas
- **Multiple points:** Not needed (island is small enough)
- **Bounding box:** Meetup API doesn't support, only radius

**Validation:**
- Test query should return events from:
  - Las Palmas (capital, north)
  - Maspalomas (south)
  - Agaete (northwest)
  - Vecindario (southeast)
- Manual verification during testing

**Edge Cases:**
- Events on nearby islands (Tenerife, Fuerteventura): Excluded by radius
- Events marked as "Gran Canaria" but with wrong coordinates: Rare, accept minor inaccuracy

### Status: ✅ ANSWERED

---

## 7. Testing Approach

### Questions
- How to mock Meetup GraphQL API?
- How to test OAuth2 flow without real credentials?
- What error scenarios to cover?

### Findings

**GraphQL Mocking:**
```typescript
// Use msw (Mock Service Worker) or simple fetch mock
import { graphql } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  graphql.query('GetGranCanariaEvents', (req, res, ctx) => {
    return res(ctx.data({
      eventsSearch: {
        edges: [{ node: { id: '1', title: 'Test Event', ... } }],
        pageInfo: { hasNextPage: false }
      }
    }));
  })
];

const server = setupServer(...handlers);
```

**OAuth2 Testing:**
```typescript
// Mock token exchange
vi.mock('@/lib/meetup/auth', () => ({
  getAccessToken: vi.fn().mockResolvedValue('mock_access_token'),
  refreshAccessToken: vi.fn().mockResolvedValue('new_mock_token')
}));

// Test token refresh on 401
test('refreshes token on 401 and retries', async () => {
  // First call returns 401, second succeeds
  mockFetch
    .mockResolvedValueOnce({ status: 401, json: async () => ({ error: 'Unauthorized' }) })
    .mockResolvedValueOnce({ status: 200, json: async () => ({ data: {...} }) });

  const result = await fetchMeetupEvents();
  expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  expect(result).toHaveLength(1);
});
```

**Error Scenarios:**
1. **401 Unauthorized:** Token expired → refresh → retry
2. **429 Rate Limit:** Backoff → retry
3. **500 Server Error:** Log error, skip event
4. **Network timeout:** Catch and log
5. **Invalid response schema:** Validate and skip malformed events
6. **Missing required fields:** Log warning, skip event

**Test Structure:**
```
src/lib/meetup/__tests__/
  auth.test.ts          # OAuth2 helpers

src/lib/ingestion/__tests__/
  meetup.test.ts        # Fetcher + transformer
  meetup-pipeline.test.ts  # End-to-end pipeline
```

**Coverage Targets:**
- Auth: 95%+ (critical path)
- Fetcher: 90%+ (happy path + errors)
- Transformer: 95%+ (all edge cases)
- Pipeline: 85%+ (integration test)

### Status: ✅ ANSWERED

---

## 8. Integration with Existing Cron Job

### Questions
- How to add Meetup without affecting Instagram/Slack?
- Should pipelines run in parallel or sequence?
- How to handle partial failures?

### Findings

**Current Cron Structure:**
```typescript
// src/app/api/cron/ingest/route.ts
export async function GET(request: Request) {
  let instagram = { error: "not run" };
  let slack = { error: "not run" };

  try { instagram = await ingestFromInstagram(accounts); } catch (err) { ... }
  try { slack = await ingestFromSlack(); } catch (err) { ... }

  return NextResponse.json({ instagram, slack, timestamp });
}
```

**Adding Meetup:**
```typescript
let meetup: PipelineResult | { error: string } = { error: "not run" };

try {
  meetup = await ingestFromMeetup();
  console.log("[cron/ingest] Meetup result:", meetup);
} catch (err) {
  const message = err instanceof Error ? err.message : String(err);
  console.error("[cron/ingest] Meetup ingestion failed:", message);
  meetup = { error: message };
}

return NextResponse.json({ instagram, slack, meetup, timestamp });
```

**Execution Strategy:**
- **Sequential:** Run Instagram → Slack → Meetup (simplest, current pattern)
- **Parallel:** `Promise.all([ingestFromInstagram(), ingestFromSlack(), ingestFromMeetup()])` (faster)
- **Recommendation:** Keep sequential for v1 (easier debugging, independent error handling)

**Failure Isolation:**
- Each pipeline in separate try/catch (already implemented)
- One pipeline failure doesn't affect others
- All results returned in JSON (success or error)

**Conditional Execution:**
```typescript
// Skip Meetup if env vars not configured
const hasMeetupCreds = !!process.env.MEETUP_CLIENT_ID && !!process.env.MEETUP_REFRESH_TOKEN;

if (hasMeetupCreds) {
  try { meetup = await ingestFromMeetup(); } catch (err) { ... }
} else {
  meetup = { error: "Meetup credentials not configured" };
  console.log("[cron/ingest] Skipping Meetup: credentials not set");
}
```

### Status: ✅ ANSWERED

---

## Summary

All major research questions have been answered. Ready to proceed with implementation.

**Next Steps:**
1. Register Meetup Developer app (Plan 01)
2. Implement OAuth2 helpers (Plan 01)
3. Create GraphQL client (Plan 02)
4. Implement data transformation (Plan 03)
5. Build pipeline (Plan 04)
6. Integrate into cron (Plan 05)
7. Write tests (Plan 06)

**Outstanding Items to Validate During Implementation:**
- [ ] Actual point cost per query (monitor during testing)
- [ ] Token expiry time (measure empirically)
- [ ] Image URL availability percentage
- [ ] Category distribution for Gran Canaria events
- [ ] Recurring event handling (verify structure)
