# Meetup Integration - Execution Guide

## Quick Start

This phase is **ready for execution**. All research is complete, architecture decisions are made, and the implementation plan is detailed.

## Pre-Execution Checklist

- [x] Research complete (OAuth2, GraphQL API, rate limiting)
- [x] Implementation plan written (6 sub-plans)
- [x] Architecture decisions documented
- [x] Integration points identified
- [x] Test strategy defined
- [x] Risk assessment complete

## Execution Order

Execute plans **sequentially** in this order:

### 1. Plan 01: Research & OAuth Setup (First)
**Why first:** Need working credentials to test everything else
**Output:** OAuth2 helpers, test credentials, working access token
**Verification:** Can query `{ self { id name } }` successfully

### 2. Plan 02: GraphQL Client & Event Fetcher
**Depends on:** Plan 01 (needs auth)
**Output:** `fetchMeetupEvents()` function
**Verification:** Returns array of Gran Canaria events

### 3. Plan 03: Data Transformation & Category Mapping
**Depends on:** Plan 02 (needs event structure)
**Output:** `transformMeetupEvent()` function
**Verification:** Meetup events convert to RawEvent format

### 4. Plan 04: Meetup Ingestion Pipeline
**Depends on:** Plans 02-03
**Output:** `ingestFromMeetup()` pipeline
**Verification:** Events appear in Supabase from standalone script

### 5. Plan 05: Update Types & Cron Integration
**Depends on:** Plan 04 (needs working pipeline)
**Output:** Updated cron job with Meetup
**Verification:** Cron endpoint returns Meetup results

### 6. Plan 06: Testing & Documentation
**Depends on:** Plans 01-05 (tests all code)
**Output:** Test suite, updated docs
**Verification:** All tests pass, coverage >90%

## Parallel Opportunities

Some tasks can run in parallel:

- **Plan 01 + Plan 02 research:** OAuth setup and GraphQL exploration can happen together
- **Plan 06 tests:** Can write tests alongside Plans 02-04 (TDD approach)

## Environment Setup

Before starting Plan 01:

1. **Register Meetup App:**
   - Visit: https://www.meetup.com/api/oauth/
   - Create new OAuth consumer
   - Note: client_id, client_secret
   - Set redirect_uri (for initial auth flow)

2. **Get Refresh Token (One-time):**
   ```bash
   # Step 1: Get authorization code (browser)
   https://secure.meetup.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=YOUR_REDIRECT_URI

   # Step 2: Exchange for tokens (curl)
   curl -X POST https://secure.meetup.com/oauth2/access \
     -d "client_id=YOUR_CLIENT_ID" \
     -d "client_secret=YOUR_CLIENT_SECRET" \
     -d "grant_type=authorization_code" \
     -d "redirect_uri=YOUR_REDIRECT_URI" \
     -d "code=AUTHORIZATION_CODE"

   # Save refresh_token from response
   ```

3. **Add to .env.local:**
   ```bash
   MEETUP_CLIENT_ID=your_client_id_here
   MEETUP_CLIENT_SECRET=your_client_secret_here
   MEETUP_REFRESH_TOKEN=your_refresh_token_here
   ```

## Testing Strategy

Each plan should be tested before moving to the next:

- **Plan 01:** Run test script to verify token refresh works
- **Plan 02:** Run fetcher to see raw events from API
- **Plan 03:** Transform sample events, verify output
- **Plan 04:** Run standalone pipeline script
- **Plan 05:** Test cron endpoint locally
- **Plan 06:** Run full test suite

## Success Metrics

Track these during execution:

- [ ] OAuth2 token refresh works automatically
- [ ] Can fetch 50+ events from Gran Canaria
- [ ] >95% of events map to correct categories
- [ ] No duplicate events in database
- [ ] Rate limit errors handled gracefully
- [ ] Tests pass: `npm test`
- [ ] Coverage: `npm run test:coverage` shows >90%
- [ ] Cron job runs successfully with all 3 sources

## Rollback Plan

If issues occur:

1. **Plan 01-03:** No database changes, safe to iterate
2. **Plan 04:** Pipeline creates events in DB
   - Rollback: Delete events where `source = 'meetup'`
   - SQL: `DELETE FROM events WHERE source = 'meetup';`
3. **Plan 05:** Cron integration
   - Rollback: Comment out Meetup block in route.ts
   - Existing sources (Instagram, Slack) unaffected

## Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Token expired, refresh_token invalid
**Fix:** Re-run OAuth2 authorization flow, get new refresh_token

### Issue: 429 Rate Limit
**Solution:** Hitting 500 points/60s limit
**Fix:** Reduce fetch size (50 → 25 events), add longer backoff

### Issue: Category mapping inaccurate
**Solution:** Keyword mapping missing cases
**Fix:** Add more keywords or fallback to AI parser for all events

### Issue: No events returned
**Solution:** Lat/lon incorrect, radius too small, or no events in area
**Fix:** Verify coordinates, increase radius, check Meetup.com for actual events

### Issue: Tests failing
**Solution:** Mocks not matching API structure
**Fix:** Update mocks to match real API responses

## Time Estimates

(Informational only, not hard deadlines)

- **Plan 01:** 1-2 hours (including OAuth setup)
- **Plan 02:** 1-2 hours (GraphQL query + fetcher)
- **Plan 03:** 2-3 hours (transformation + category logic)
- **Plan 04:** 2-3 hours (pipeline + standalone script)
- **Plan 05:** 1 hour (cron integration)
- **Plan 06:** 2-3 hours (test suite)

**Total:** ~10-14 hours of focused work

## Next Steps After Completion

Once Phase 07 is complete:

1. **Monitor in production:**
   - Check daily cron logs for Meetup ingestion
   - Verify events appear on homepage
   - Track category distribution

2. **Iterate if needed:**
   - Adjust category mapping based on real data
   - Fine-tune rate limiting strategy
   - Add more filtering if too many irrelevant events

3. **Document learnings:**
   - Update 07-SUMMARY.md with actual results
   - Note any API quirks discovered
   - Document point consumption rates

4. **Move to Phase 06 (Polish & Deploy):**
   - All three event sources (Instagram, Slack, Meetup) working
   - Ready for production deployment

## Questions During Execution?

Refer to:
- **07-PLAN.md** - Detailed task lists
- **07-CONTEXT.md** - Architecture and background
- **07-RESEARCH.md** - API specifics and findings
- **Existing pipelines** - `instagram-pipeline.ts`, `slack-pipeline.ts` for reference

---

**Status:** 🟢 Ready to Execute
**Start with:** Plan 01 - Research & OAuth Setup
