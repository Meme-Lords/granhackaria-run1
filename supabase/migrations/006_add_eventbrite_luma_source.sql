-- Allow source = 'eventbrite' and 'luma' for Event Scraper Pro multi-platform ingestion.

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_source_check;
ALTER TABLE events ADD CONSTRAINT events_source_check
  CHECK (source IN ('instagram', 'slack', 'manual', 'meetup', 'eventbrite', 'luma'));
