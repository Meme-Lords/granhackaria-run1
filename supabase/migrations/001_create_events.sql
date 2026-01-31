-- Migration: Create events table
-- Phase 01: Supabase Schema & Client Setup

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date_start DATE NOT NULL,
  date_end DATE,
  time TEXT,
  location TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('music', 'arts', 'food', 'sports', 'festival', 'theater', 'workshop', 'market')),
  image_url TEXT,
  source TEXT NOT NULL CHECK (source IN ('instagram', 'slack', 'manual')),
  source_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for common query patterns
CREATE INDEX idx_events_date_start ON events (date_start);
CREATE INDEX idx_events_category ON events (category);
CREATE UNIQUE INDEX idx_events_source_url ON events (source_url) WHERE source_url IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access to all events
CREATE POLICY "Allow anonymous read access"
  ON events
  FOR SELECT
  TO anon
  USING (true);
