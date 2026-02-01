# Phase 08: Bilingual Event Content

## Overview

This phase adds fully bilingual support for event titles and descriptions, making the entire EventosGC experience seamlessly switch between English and Spanish when users toggle the language.

## Status

**Phase Status:** 📋 PLANNED (Ready for execution)
**Created:** 2026-02-01
**Complexity:** Medium-High
**Estimated Plans:** 10 (9 required + 1 optional cleanup)

## Goal

Make event content (titles, descriptions, dates) display in the user's selected language, matching the existing bilingual UI quality across all three event sources (Instagram, Slack, Meetup).

## Success Criteria

- [ ] Event titles display in English when locale = "en"
- [ ] Event titles display in Spanish when locale = "es"
- [ ] Event descriptions display in correct language
- [ ] Date formatting uses correct locale ("Mon, Jan 6" vs "lun, 6 ene")
- [ ] All three event sources store bilingual content
- [ ] Language switching is instant (no runtime translation)
- [ ] Existing events migrated with both languages
- [ ] Fallback logic handles missing translations gracefully
- [ ] Test coverage >90%
- [ ] Document title and `<html lang>` update with locale

## Documents

- **[08-PLAN.md](./08-PLAN.md)** - Detailed implementation plan with 10 sub-plans
- **[08-CONTEXT.md](./08-CONTEXT.md)** - Architecture, i18n system, AI translation strategy

## Plans

1. **Plan 01: Database Schema Migration** - Add bilingual columns (title_en/es, description_en/es)
2. **Plan 02: Update Parser for Bilingual Extraction** - AI extracts and translates in one call
3. **Plan 03: Update Event Types and Interfaces** - TypeScript types for bilingual fields
4. **Plan 04: Update Ingestion Pipelines** - Instagram, Slack, Meetup store bilingual
5. **Plan 05: Update Query Layer** - Pass locale, select appropriate language
6. **Plan 06: Update Page Components** - Server-side locale detection, pass to queries
7. **Plan 07: Migrate Existing Events** - Translate ~100 existing events
8. **Plan 08: Update Metadata and HTML Lang** - Dynamic document title and lang attribute
9. **Plan 09: Testing and Documentation** - Comprehensive tests, update docs
10. **Plan 10: Cleanup (Optional)** - Remove legacy columns after validation

## Key Decisions

**Storage Approach:** Store both languages in database (vs. runtime translation)
- Pros: Instant switching, no API dependency, better performance
- Cons: Slightly larger DB, one-time migration effort

**Translation Method:** AI during ingestion (Claude Opus/Sonnet)
- Single API call extracts AND translates (cost-efficient: ~$3/year increase)
- Context-aware, culturally appropriate translations
- Quality: High (Claude > Google Translate for event content)

**Locale Detection:** Server-side via cookies
- `getLocaleFromRequest()` reads cookie set by client-side toggle
- Server components get locale without hydration issues
- SEO-friendly (content in initial HTML)

**Fallback Strategy:** Multi-level fallback
- Spanish requested → `title_es ?? title_en ?? title` (legacy)
- English requested → `title_en ?? title_es ?? title` (legacy)
- Ensures users always see content, even during migration

## Dependencies

**Blocks:** None (improves all event sources)

**Blocked By:** None (independent of Phase 07 Meetup)

**Note:** If Phase 07 (Meetup) ships first, Plan 04 will update it. If Phase 08 ships first, Phase 07 will include bilingual from the start.

## Cost Analysis

**AI Translation Cost:**
- Current: ~$0.00015/event
- Bilingual: ~$0.00029/event
- Increase: +$0.00014/event (<0.02 cents)

**Annual Impact:**
- 50 events/day × 365 days = 18,250 events/year
- Additional cost: ~$2.55/year (negligible)

**One-Time Migration:**
- ~100 existing events
- Cost: ~$0.01 (one cent)

**Conclusion:** Minimal cost for massive UX improvement.

## Implementation Highlights

### Database Schema
```sql
ALTER TABLE events ADD COLUMN title_en TEXT;
ALTER TABLE events ADD COLUMN title_es TEXT;
ALTER TABLE events ADD COLUMN description_en TEXT;
ALTER TABLE events ADD COLUMN description_es TEXT;
ALTER TABLE events ADD COLUMN source_language VARCHAR(2);
```

### Parser (Bilingual Extraction)
```typescript
// AI prompt extracts both languages in one call
{
  "title_en": "Jazz Night at Beach Bar",
  "title_es": "Noche de Jazz en Beach Bar",
  "description_en": "Live jazz performance...",
  "description_es": "Actuación de jazz en vivo...",
  "source_language": "en"
}
```

### Query Layer (Locale Selection)
```typescript
const title = locale === 'es'
  ? (row.title_es ?? row.title_en ?? row.title)  // Fallback chain
  : (row.title_en ?? row.title_es ?? row.title);
```

### Page Component (Server-Side Locale)
```typescript
const locale = getLocaleFromRequest(); // Read from cookie
const events = await getTodayEvents(locale);
```

## Risk Assessment

**High Risk:**
- Migration script errors → Use staging environment, backup database first
- Translation quality issues → Manual review samples, use Claude for quality

**Medium Risk:**
- SSR/CSR locale mismatch → Use cookies for consistency, test thoroughly
- Performance impact → Selective column fetching, existing indexes sufficient

**Low Risk:**
- AI translation cost → Cost increase ~$3/year, negligible

## Testing Strategy

- **Unit Tests:** Parser bilingual extraction, query locale selection
- **Integration Tests:** Pipeline end-to-end with bilingual storage
- **E2E Tests:** Language toggle switches event content
- **Manual Testing:** Review sample translations for quality

**Target Coverage:** >90% for new code

## Migration Safety

**Rollback Plan:**
1. **Before Plan 07 execution:** Backup database
2. **If migration fails:** Restore from backup
3. **If translations poor:** Re-run migration script with improved prompts
4. **If app breaks:** Revert code, keep bilingual data for later

**Migration Validation:**
- Run in staging first
- Spot-check 10 random events manually
- Verify all events have bilingual fields populated
- Monitor for 30 days before optional cleanup (Plan 10)

## Execution Timeline

**Sequential Order:**
1. Plan 01 (Schema) → Foundation
2. Plans 02-03 (Parser, Types) → Can run in parallel
3. Plans 04-06 (Pipelines, Queries, Pages) → Sequential
4. Plan 07 (Migration) → After pipelines updated
5. Plan 08 (Metadata) → Anytime, independent
6. Plan 09 (Testing) → Continuous throughout
7. Plan 10 (Cleanup) → 30+ days after production validation

**Parallel Opportunities:**
- Plans 02-03 can run together (parser + types)
- Plan 08 independent of others
- Plan 09 tests written alongside Plans 02-07 (TDD)

## Post-Completion

**Monitor:**
- Language toggle usage (analytics)
- Translation quality (user feedback)
- Performance (query times)
- Cost (AI API usage)

**Future Enhancements:**
- Add more languages (French, German for tourists)
- User feedback on translations (crowdsourced corrections)
- A/B test translation quality (Claude vs. DeepL)

## Questions?

Refer to:
- **08-PLAN.md** - Detailed task lists for each plan
- **08-CONTEXT.md** - Architecture deep dive, i18n system, AI strategy
- **Existing codebase** - `src/lib/i18n/` for current i18n implementation

---

**Status:** 🟢 Ready to Execute
**Start with:** Plan 01 - Database Schema Migration
