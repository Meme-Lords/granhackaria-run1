-- Mark events whose source_url returns 404/410 so we can hide them from the list.
-- Updated by cron when checking source URL health.

ALTER TABLE events ADD COLUMN source_url_gone BOOLEAN DEFAULT false;

CREATE INDEX idx_events_source_url_gone ON events (source_url_gone) WHERE source_url_gone = true;
