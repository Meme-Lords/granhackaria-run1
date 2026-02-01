# Phase 07: Meetup Integration

## Overview

This phase adds Meetup.com as a third event source to EventosGC, expanding event coverage by tapping into the Meetup platform's community events, workshops, networking events, and recurring meetups in the Gran Canaria area.

## Status

**Phase Status:** 📋 PLANNED (Ready for execution)
**Created:** 2026-02-01
**Complexity:** Medium
**Estimated Plans:** 6

## Goal

Enable automatic ingestion of community events from Meetup.com for the Gran Canaria region (50km radius), transforming them into EventosGC's standard format and integrating them into the existing cron-based ingestion pipeline.

## Success Criteria

- [ ] Meetup events appear in Supabase with `source="meetup"`
- [ ] Events are geographically filtered for Gran Canaria (50km radius)
- [ ] Category mapping is accurate (8 EventosGC categories)
- [ ] Duplicates are prevented via unique constraint on source_url
- [ ] OAuth2 authentication works with automatic token refresh
- [ ] Rate limiting (500 points/60s) is handled gracefully
- [ ] Pipeline runs successfully in daily cron job
- [ ] Test coverage matches existing pipelines (>90%)

## Documents

- **[07-PLAN.md](./07-PLAN.md)** - Detailed implementation plan with 6 sub-plans
- **[07-CONTEXT.md](./07-CONTEXT.md)** - Background, API overview, and architecture context
- **[07-RESEARCH.md](./07-RESEARCH.md)** - Research findings for OAuth2, GraphQL, rate limiting, etc.

## Plans

1. **Plan 01: Research & OAuth Setup** - Register app, implement token exchange/refresh
2. **Plan 02: GraphQL Client & Event Fetcher** - Create Meetup client, eventsSearch query
3. **Plan 03: Data Transformation & Category Mapping** - Transform to RawEvent, map categories
4. **Plan 04: Meetup Ingestion Pipeline** - End-to-end pipeline matching Instagram/Slack pattern
5. **Plan 05: Update Types & Cron Integration** - Add to existing cron job
6. **Plan 06: Testing & Documentation** - Test coverage, update docs

## Key Decisions

- **Authentication:** OAuth2 with refresh_token stored in environment variables
- **Location Filtering:** Single center point (Las Palmas: 27.9202, -15.5474) with 50km radius
- **Category Mapping:** Hybrid approach (keyword mapping + AI fallback)
- **Rate Limiting:** Conservative 50 events per query, exponential backoff on 429
- **Execution:** Sequential pipeline execution (Instagram → Slack → Meetup)
- **Pricing:** Set to null (Meetup API doesn't expose ticket prices)

## Dependencies

**Blocks:** None
**Blocked By:** None (Phase 05 completed)

**External Dependencies:**
- Meetup Developer account registration
- OAuth2 app credentials (client_id, client_secret, refresh_token)
- Access to Meetup GraphQL API

## Environment Variables

```bash
MEETUP_CLIENT_ID=your_client_id_here
MEETUP_CLIENT_SECRET=your_client_secret_here
MEETUP_REFRESH_TOKEN=your_refresh_token_here
```

## Files to Create

```
src/lib/meetup/
├── auth.ts                           # OAuth2 token exchange/refresh
└── __tests__/
    └── auth.test.ts

src/lib/ingestion/
├── meetup.ts                         # GraphQL client + fetcher + transformer
├── meetup-pipeline.ts                # Pipeline orchestration
└── __tests__/
    ├── meetup.test.ts
    └── meetup-pipeline.test.ts
```

## Files to Modify

```
src/lib/ingestion/types.ts            # Add "meetup" to source union type
src/app/api/cron/ingest/route.ts      # Add Meetup pipeline execution
src/app/api/cron/ingest/__tests__/route.test.ts  # Add Meetup tests
.env.example                          # Document Meetup env vars
.planning/PROJECT.md                  # Update vision/solution
.planning/STATE.md                    # Mark Phase 07 complete (after execution)
```

## Risk Assessment

**High Risk:**
- OAuth2 flow complexity (mitigation: thorough testing)
- Rate limiting blocking ingestion (mitigation: conservative limits, backoff)

**Medium Risk:**
- Category mapping accuracy (mitigation: AI fallback)
- Timezone handling (mitigation: ISO parsing with local timezone)

**Low Risk:**
- API schema changes (mitigation: GraphQL introspection)

## References

- [Meetup API Guide](https://www.meetup.com/api/guide/)
- [Meetup GraphQL Playground](https://www.meetup.com/api/playground/)
- [OAuth2 Documentation](https://www.meetup.com/api/authentication/)
- Existing pipelines: `src/lib/ingestion/instagram-pipeline.ts`, `src/lib/ingestion/slack-pipeline.ts`

## Notes

- Follow existing pipeline patterns exactly (Instagram/Slack as reference)
- Reuse shared `parseEventFromText()` for category classification
- Keep OAuth2 implementation simple (no complex token rotation initially)
- Monitor rate limit consumption during testing
- Consider adding Meetup group filtering in future phase (v2)

---

**Next Step:** Execute Plan 01 (Research & OAuth Setup)
