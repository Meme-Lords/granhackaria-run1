# Phase 08: Bilingual Event Content - Execution Guide

## Quick Start

This phase adds fully bilingual event content (titles, descriptions, dates) to match your existing bilingual UI. All research is complete, architecture is defined, and the plan is detailed and ready for execution.

## Pre-Execution Checklist

- [x] Existing i18n system documented (src/lib/i18n)
- [x] Current event schema analyzed
- [x] AI translation strategy defined
- [x] Cost analysis complete (~$3/year increase)
- [x] Migration approach designed
- [x] Fallback logic specified
- [x] Testing strategy outlined
- [x] Risk assessment complete

## Execution Order

Execute plans **in this specific order** (some can be parallelized):

### Phase 1: Foundation (Sequential)

#### Plan 01: Database Schema Migration ⚠️ START HERE
**Why first:** All other plans depend on bilingual columns existing
**Output:** New columns in events table (title_en/es, description_en/es, source_language)
**Verification:** Run migration, verify columns in Supabase dashboard
**Rollback:** Drop columns if needed (save backup first!)

---

### Phase 2: Code Updates (Can parallelize Plans 02-03)

#### Plan 02: Update Parser for Bilingual Extraction
**Depends on:** Plan 01 (needs schema context)
**Can run parallel with:** Plan 03
**Output:** Parser returns bilingual fields
**Verification:** Test with sample Spanish and English posts

#### Plan 03: Update Event Types and Interfaces
**Depends on:** Plan 01 (needs schema)
**Can run parallel with:** Plan 02
**Output:** TypeScript types updated
**Verification:** `npm run build` succeeds

---

### Phase 3: Pipelines (Sequential after Phase 2)

#### Plan 04: Update Ingestion Pipelines
**Depends on:** Plans 02-03 (needs parser + types)
**Output:** All three pipelines store bilingual
**Verification:** Run each pipeline standalone, check Supabase

#### Plan 05: Update Query Layer
**Depends on:** Plan 03 (needs types)
**Can run parallel with:** Plan 04
**Output:** Queries accept locale, select by language
**Verification:** Unit tests pass

#### Plan 06: Update Page Components
**Depends on:** Plan 05 (needs query updates)
**Output:** Pages pass locale to queries
**Verification:** App runs, language toggle works

---

### Phase 4: Migration (After pipelines updated)

#### Plan 07: Migrate Existing Events ⚠️ CRITICAL
**Depends on:** Plans 04-06 (pipelines must work first)
**Output:** ~100 existing events translated
**Verification:** All events have bilingual fields, spot-check quality
**Safety:** Run in staging first, backup DB!

---

### Phase 5: Polish (Independent)

#### Plan 08: Update Metadata and HTML Lang
**Depends on:** None (independent)
**Can run:** Anytime after Plan 06
**Output:** Document title and lang update with locale
**Verification:** Toggle language, check browser tab and HTML

#### Plan 09: Testing and Documentation
**Depends on:** All previous plans (tests everything)
**When:** Continuous throughout, finalize at end
**Output:** Test suite, updated docs
**Verification:** `npm test` passes, coverage >90%

---

### Phase 6: Cleanup (Optional, after 30 days)

#### Plan 10: Cleanup Legacy Columns
**Depends on:** 30+ days of production validation
**Optional:** Can skip if keeping legacy as safety net
**Output:** Removed title/description columns
**Verification:** App works without fallback columns

---

## Parallel Execution Opportunities

To speed up execution:

**Wave 1 (After Plan 01):**
- Run Plan 02 (Parser) in one terminal
- Run Plan 03 (Types) in another terminal
- Both are independent, can execute simultaneously

**Wave 2 (After Wave 1):**
- Run Plan 04 (Pipelines) - must be sequential with Plan 02
- Run Plan 05 (Queries) - can run parallel to Plan 04 after Plan 03

**Wave 3 (After Wave 2):**
- Run Plan 06 (Pages)
- Run Plan 08 (Metadata) in parallel (independent)

**Wave 4 (After Wave 3):**
- Run Plan 07 (Migration) - **only after pipelines work!**

**Wave 5 (Throughout):**
- Run Plan 09 (Testing) continuously alongside all plans

## Critical Safety Points

### Before Plan 01 (Schema Migration)
- [ ] Backup Supabase database (full export)
- [ ] Test migration in local Supabase instance first
- [ ] Document rollback plan (drop columns script)

### Before Plan 07 (Data Migration)
- [ ] Verify Plans 04-06 working (new ingestion stores bilingual)
- [ ] Test migration script on 5 sample events first
- [ ] Backup database again (before bulk translation)
- [ ] Run in staging/test environment first
- [ ] Manual review of 10 random translations before production

### During Plan 07 (Migration Execution)
- [ ] Process in batches (20 events at a time)
- [ ] Log all translations for review
- [ ] Pause if error rate >5%
- [ ] Spot-check every 50 events

## Environment Setup

**No new environment variables needed!**

Existing variables are sufficient:
- `ANTHROPIC_API_KEY` - Already used by parser
- `NEXT_PUBLIC_SUPABASE_URL` - Already configured
- `SUPABASE_SECRET_KEY` - Already configured

## Testing Checkpoints

After each plan:

**Plan 01:**
```bash
# In Supabase SQL editor:
SELECT column_name FROM information_schema.columns
WHERE table_name = 'events' AND column_name LIKE '%_en';
# Should return: title_en, description_en
```

**Plan 02:**
```bash
# Test parser manually:
npm run test src/lib/ingestion/__tests__/parser.test.ts
```

**Plan 04:**
```bash
# Run Instagram pipeline standalone:
npx tsx src/lib/ingestion/instagram-pipeline.ts

# Check Supabase for bilingual event:
SELECT title_en, title_es, source_language FROM events
WHERE source = 'instagram'
ORDER BY created_at DESC LIMIT 1;
```

**Plan 05:**
```bash
# Test queries:
npm run test src/lib/queries/__tests__/events.test.ts
```

**Plan 06:**
```bash
# Run dev server:
npm run dev
# Open http://localhost:3000
# Toggle language (EN/ES) in navbar
# Verify event titles switch
```

**Plan 07:**
```bash
# Verify migration results:
SELECT
  COUNT(*) as total,
  COUNT(title_en) as has_en,
  COUNT(title_es) as has_es,
  COUNT(source_language) as has_lang
FROM events;
# All counts should match
```

**Plan 09:**
```bash
# Full test suite:
npm test

# Coverage report:
npm run test:coverage
# Should show >90% for modified files
```

## Common Issues & Solutions

### Issue: Parser doesn't return bilingual fields
**Symptom:** Parser returns null for title_en or title_es
**Solution:**
- Check prompt template includes bilingual instructions
- Verify AI model (Claude Sonnet/Opus) is used
- Test with simpler event text (e.g., "Jazz Night Friday 8pm")

### Issue: TypeScript errors after type updates
**Symptom:** Build fails with type mismatches
**Solution:**
- Run `npm run build` to see all errors
- Check EventRow interface matches database columns
- Verify RawEvent interface includes bilingual fields

### Issue: Query returns null for event content
**Symptom:** Events display with no title/description
**Solution:**
- Check fallback chain: `row.title_es ?? row.title_en ?? row.title`
- Verify database has bilingual columns populated
- Check query SELECT includes all needed columns

### Issue: Language toggle doesn't update events
**Symptom:** UI switches but event titles stay same language
**Solution:**
- Verify cookie is set: Check Application > Cookies > localhost > locale
- Check `getLocaleFromRequest()` reads cookie correctly
- Verify `toEventCardProps()` uses locale parameter
- Hard refresh page (Ctrl+Shift+R) to clear client cache

### Issue: Migration script fails
**Symptom:** Batch translation returns errors
**Solution:**
- Check ANTHROPIC_API_KEY is valid
- Reduce batch size (20 → 10 events)
- Add error handling for individual event failures
- Log failed events and retry manually

### Issue: Hydration error (SSR/CSR mismatch)
**Symptom:** Console warns about hydration mismatch
**Solution:**
- Ensure server and client use same locale source (cookie)
- Check `getLocaleFromRequest()` matches client-side `useI18n()`
- Verify no client-only rendering of event content

## Performance Monitoring

Track these metrics during/after execution:

**Database:**
- Query time before: `SELECT * FROM events LIMIT 50`
- Query time after: Same query with bilingual columns
- Expected: <10ms difference (negligible)

**API Costs:**
- Track Anthropic API usage in dashboard
- Before migration: ~$0.01/day
- After migration: ~$0.015/day (+50%)
- One-time migration: ~$0.01 total

**Page Load:**
- Measure homepage load time before/after
- Expected: No significant change (same number of events)

## Rollback Procedures

### If Plan 01 fails (schema migration):
```sql
-- Drop columns
ALTER TABLE events
  DROP COLUMN title_en,
  DROP COLUMN title_es,
  DROP COLUMN description_en,
  DROP COLUMN description_es,
  DROP COLUMN source_language;
```

### If Plan 07 fails (data migration):
```sql
-- Clear bilingual fields
UPDATE events SET
  title_en = NULL,
  title_es = NULL,
  description_en = NULL,
  description_es = NULL,
  source_language = NULL;

-- Or restore from backup
```

### If app breaks after deployment:
1. Revert code changes (git revert)
2. Keep bilingual data in database (safe)
3. Fix issues and redeploy
4. Data remains intact for retry

## Success Metrics

After full execution:

- [ ] All events have `title_en` AND `title_es` populated
- [ ] Language toggle switches event content instantly
- [ ] Date formatting follows locale ("Mon, Jan 6" vs "lun, 6 ene")
- [ ] No hydration errors in console
- [ ] Test coverage >90%
- [ ] Document title updates with language
- [ ] HTML `lang` attribute updates with language
- [ ] Translation quality: Manual review of 20 events = 95%+ accurate
- [ ] API cost increase: <$5/year
- [ ] Page load time: No degradation

## Post-Completion Tasks

Within 7 days:
- [ ] Monitor error logs for any locale-related issues
- [ ] Gather user feedback on translation quality
- [ ] Check analytics: language toggle usage
- [ ] Verify cron jobs running successfully with bilingual

Within 30 days:
- [ ] Review 50+ events for translation quality
- [ ] Fix any mistranslations (direct database updates)
- [ ] Consider Plan 10 (cleanup legacy columns) if stable

## Next Steps After Phase 08

Once bilingual event content is live:

1. **Ship Phase 07 (Meetup)** if not already done
   - Meetup pipeline will include bilingual from start
   - No migration needed for Meetup events

2. **Move to Phase 06 (Polish & Deploy)** if ready
   - All event sources working
   - Fully bilingual UI and content
   - Ready for production launch

3. **Future enhancements:**
   - Add more languages (French, German, Italian)
   - User-submitted translation corrections
   - AI quality improvement (fine-tuning on corrections)

---

**Status:** 🟢 Ready to Execute
**Start with:** Plan 01 - Database Schema Migration
**Estimated effort:** ~15-20 hours focused work (spread over several days)
**Risk level:** Medium (migration is critical step, but reversible)

Good luck! 🚀
