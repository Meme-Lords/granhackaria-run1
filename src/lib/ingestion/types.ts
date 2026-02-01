export interface RawInstagramPost {
  id: string;
  caption: string | null;
  image_url: string | null;
  permalink: string;
  timestamp: string;
  username: string;
}

export interface RawEvent {
  title: string;
  description: string | null;
  date_start: string; // ISO date string (YYYY-MM-DD)
  time: string | null; // HH:MM format
  location: string;
  ticket_price: string | null; // e.g. "15€", "Free", "From 10€"
  category:
    | "music"
    | "arts"
    | "food"
    | "sports"
    | "festival"
    | "theater"
    | "workshop"
    | "market";
  image_url: string | null;
  source: "instagram" | "slack" | "manual";
  source_url: string | null;
}
