-- Add explicit UNIQUE constraint on source_url so Supabase upsert onConflict works.
-- (Partial unique index idx_events_source_url is not used by client ON CONFLICT.)

ALTER TABLE events ADD CONSTRAINT events_source_url_key UNIQUE (source_url);
