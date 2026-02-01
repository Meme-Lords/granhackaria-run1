import { createSupabaseServer } from "@/lib/supabase/server";
import type { EventCardProps, CategoryVariant } from "@/components";
import type { Locale } from "@/lib/i18n/translations";

interface EventRow {
  id: string;
  title: string;
  title_en: string | null;
  title_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  source_language: string | null;
  date_start: string;
  date_end: string | null;
  time: string | null;
  location: string;
  category: string;
  ticket_price: string | null;
  image_url: string | null;
  source: string;
  source_url: string | null;
  created_at: string;
}

function formatWeekdayDate(dateStr: string, locale: Locale): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString(locale === "es" ? "es-ES" : "en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toEventCardProps(row: EventRow, showClock: boolean, locale: Locale): EventCardProps {
  const title = locale === "es"
    ? (row.title_es ?? row.title)
    : (row.title_en ?? row.title);

  const description = locale === "es"
    ? (row.description_es ?? row.description)
    : (row.description_en ?? row.description);

  return {
    imageUrl:
      row.image_url ??
      "https://images.unsplash.com/photo-1516275992531-b5e19d647811?w=1080",
    category: row.category as CategoryVariant,
    time: showClock && row.time ? row.time : (row.time ?? formatWeekdayDate(row.date_start, locale)),
    title,
    description,
    location: row.location,
    ticket_price: row.ticket_price,
    showClock,
    sourceUrl: row.source_url,
  };
}

const CATEGORY_VARIANTS: CategoryVariant[] = [
  "music",
  "arts",
  "food",
  "sports",
  "festival",
  "theater",
  "workshop",
  "market",
];

function isValidCategory(value: string | undefined): value is CategoryVariant {
  return value !== undefined && (CATEGORY_VARIANTS as string[]).includes(value);
}

function getDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export async function getTodayEvents(
  locale: Locale = "en",
  category?: string
): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const today = getDateString(0);

  let query = supabase
    .from("events")
    .select("*")
    .eq("date_start", today)
    .order("time", { ascending: true });

  if (isValidCategory(category)) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch today events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, true, locale));
}

export async function getTomorrowEvents(
  locale: Locale = "en",
  category?: string
): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const tomorrow = getDateString(1);

  let query = supabase
    .from("events")
    .select("*")
    .eq("date_start", tomorrow)
    .order("time", { ascending: true });

  if (isValidCategory(category)) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch tomorrow events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, false, locale));
}

export async function getThisWeekEvents(
  locale: Locale = "en",
  category?: string
): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const tomorrow = getDateString(1);
  // End of week: 7 days from now
  const weekEnd = getDateString(7);

  let query = supabase
    .from("events")
    .select("*")
    .gt("date_start", tomorrow)
    .lte("date_start", weekEnd)
    .order("date_start", { ascending: true })
    .order("time", { ascending: true });

  if (isValidCategory(category)) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Failed to fetch this week events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, false, locale));
}
