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
  title_en: string;
  title_es: string;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  source_language: "en" | "es" | "unknown";
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
  source: "instagram" | "slack" | "meetup" | "eventbrite" | "luma" | "manual";
  source_url: string | null;
}
