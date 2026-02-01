import { createSupabaseServer } from "@/lib/supabase/server";
import type { EventCardProps, CategoryVariant } from "@/components";

interface EventRow {
  id: string;
  title: string;
  description: string | null;
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

function formatWeekdayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function toEventCardProps(row: EventRow, showClock: boolean): EventCardProps {
  return {
    imageUrl:
      row.image_url ??
      "https://images.unsplash.com/photo-1516275992531-b5e19d647811?w=1080",
    category: row.category as CategoryVariant,
    time: showClock && row.time ? row.time : (row.time ?? formatWeekdayDate(row.date_start)),
    title: row.title,
    description: row.description,
    location: row.location,
    showClock,
    sourceUrl: row.source_url,
  };
}

function getDateString(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().split("T")[0];
}

export async function getTodayEvents(): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const today = getDateString(0);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("date_start", today)
    .order("time", { ascending: true });

  if (error) {
    console.error("Failed to fetch today events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, true));
}

export async function getTomorrowEvents(): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const tomorrow = getDateString(1);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("date_start", tomorrow)
    .order("time", { ascending: true });

  if (error) {
    console.error("Failed to fetch tomorrow events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, false));
}

export async function getThisWeekEvents(): Promise<EventCardProps[]> {
  const supabase = await createSupabaseServer();
  const tomorrow = getDateString(1);
  // End of week: 7 days from now
  const weekEnd = getDateString(7);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gt("date_start", tomorrow)
    .lte("date_start", weekEnd)
    .order("date_start", { ascending: true })
    .order("time", { ascending: true });

  if (error) {
    console.error("Failed to fetch this week events:", error.message);
    return [];
  }

  return (data as EventRow[]).map((row) => toEventCardProps(row, false));
}
