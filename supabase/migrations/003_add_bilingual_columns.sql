-- Phase 08: Add bilingual columns for event titles and descriptions.
-- Existing title/description columns are kept as fallback during migration.

ALTER TABLE events ADD COLUMN title_en TEXT;
ALTER TABLE events ADD COLUMN title_es TEXT;
ALTER TABLE events ADD COLUMN description_en TEXT;
ALTER TABLE events ADD COLUMN description_es TEXT;
ALTER TABLE events ADD COLUMN source_language VARCHAR(7) CHECK (source_language IN ('en', 'es', 'unknown'));

-- Rollback:
-- ALTER TABLE events DROP COLUMN title_en;
-- ALTER TABLE events DROP COLUMN title_es;
-- ALTER TABLE events DROP COLUMN description_en;
-- ALTER TABLE events DROP COLUMN description_es;
-- ALTER TABLE events DROP COLUMN source_language;
