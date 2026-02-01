-- Phase 07: Allow source = 'meetup' for Meetup.com ingestion.
-- Drop existing check and re-add with 'meetup' included.

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_source_check;
ALTER TABLE events ADD CONSTRAINT events_source_check
  CHECK (source IN ('instagram', 'slack', 'manual', 'meetup'));
