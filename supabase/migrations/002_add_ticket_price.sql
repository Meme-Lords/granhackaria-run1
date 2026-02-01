-- Add ticket_price to events (e.g. "15€", "Free", "From 10€")
ALTER TABLE events ADD COLUMN IF NOT EXISTS ticket_price TEXT;
