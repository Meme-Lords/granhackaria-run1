/**
 * Meetup ingestion via Apify Event Scraper Pro (webdatalabs/event-scraper-pro).
 * Targets Gran Canaria; used when Meetup OAuth credentials are not set.
 * Returns coverImageUrl for event images.
 */

import { keywordCategory } from "./meetup";
import type { RawEvent } from "./types";

const APIFY_ACTOR_ID = "webdatalabs~event-scraper-pro";
const DEFAULT_CITIES = ["Las Palmas"];
const DEFAULT_COUNTRY = "ES";
const DEFAULT_MAX_ITEMS_PER_PLATFORM = 3;
/** Event Scraper Pro requires maxItemsPerPlatform >= 10; we request this then slice to requested limit. */
const APIFY_MIN_MAX_ITEMS_PER_PLATFORM = 10;
/** Broader default keywords for Gran Canaria tech/community events (Actor requires at least one). */
const DEFAULT_KEYWORDS = ["tech", "meetup", "networking"];
const TIMEZONE = "Atlantic/Canary";

const ALLOWED_PLATFORMS = ["meetup", "eventbrite", "luma"] as const;
type AllowedPlatform = (typeof ALLOWED_PLATFORMS)[number];
const DEFAULT_PLATFORMS: AllowedPlatform[] = ["meetup"];

function parsePlatformsEnv(value: string | undefined): AllowedPlatform[] {
  if (!value?.trim()) return [...DEFAULT_PLATFORMS];
  const result: AllowedPlatform[] = [];
  for (const s of value.split(",").map((x) => x.trim().toLowerCase())) {
    if (ALLOWED_PLATFORMS.includes(s as AllowedPlatform)) {
      result.push(s as AllowedPlatform);
    }
  }
  return result.length > 0 ? result : [...DEFAULT_PLATFORMS];
}

function parseKeywordsEnv(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Event Scraper Pro output item shape (inferred from Actor). */
export interface ApifyMeetupItem {
  id?: string;
  title?: string;
  description?: string | null;
  startsAt?: string;
  endsAt?: string | null;
  eventUrl?: string;
  coverImageUrl?: string | null;
  city?: string | null;
  venueName?: string | null;
  address?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string;
  ticketStatus?: string;
  rsvpCount?: number | null;
  capacity?: number | null;
  organizerName?: string | null;
  organizerUrl?: string | null;
  organizerFollowers?: number | null;
  category?: string | null;
  topics?: string[];
  isOnline?: boolean;
  timezone?: string;
  platform?: string;
  canonicalKey?: string;
  discoveredAt?: string;
}

/**
 * Transform an Event Scraper Pro item into RawEvent format.
 * Maps coverImageUrl to image_url; uses keyword-based category when Actor category is missing.
 */
export function transformApifyMeetupItem(item: ApifyMeetupItem): RawEvent {
  const title = (item.title ?? "").trim() || "Untitled Event";
  const desc = item.description?.trim() ?? null;
  const combinedText = [
    item.title,
    item.description,
    item.organizerName,
    item.category,
    item.topics?.join(" "),
  ]
    .filter(Boolean)
    .join(" ");
  const category = keywordCategory(combinedText);

  let date_start = "";
  let time: string | null = null;
  if (item.startsAt) {
    try {
      const date = new Date(item.startsAt);
      date_start = date.toISOString().split("T")[0];
      time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: item.timezone ?? TIMEZONE,
      });
    } catch {
      // leave date_start empty, time null
    }
  }

  const location =
    item.isOnline
      ? "Online"
      : [item.venueName, item.address, item.city].filter(Boolean).join(", ").trim() || "Online";

  let ticket_price: string | null = null;
  if (
    item.ticketStatus &&
    item.ticketStatus !== "free" &&
    (item.priceMin != null || item.priceMax != null)
  ) {
    const min = item.priceMin ?? 0;
    const max = item.priceMax ?? min;
    const curr = item.currency?.trim() || "€";
    if (min === max) ticket_price = `${min}${curr}`;
    else ticket_price = `${min}-${max}${curr}`;
  } else if (item.priceMin != null && item.priceMin === 0) {
    ticket_price = "Free";
  }

  const platform = item.platform?.toLowerCase();
  let source: RawEvent["source"] = "meetup";
  if (platform === "eventbrite") source = "eventbrite";
  else if (platform === "luma") source = "luma";

  return {
    title,
    title_en: title,
    title_es: title,
    description: desc,
    description_en: desc,
    description_es: desc,
    source_language: "unknown",
    date_start,
    time,
    location,
    ticket_price,
    category,
    image_url: item.coverImageUrl?.trim() ?? null,
    source,
    source_url: item.eventUrl ?? null,
  };
}

/**
 * Fetch Meetup events from Apify Event Scraper Pro for Gran Canaria.
 * Uses run-sync-get-dataset-items (waits up to 300s). Requires APIFY_API_TOKEN.
 * Only returns items with platform === "meetup".
 */
export async function fetchMeetupEventsFromApify(options?: {
  keywords?: string[];
  cities?: string[];
  country?: string;
  platforms?: string[];
  dateFrom?: string;
  dateTo?: string;
  maxItemsPerPlatform?: number;
}): Promise<ApifyMeetupItem[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set");
  }

  const cities =
    options?.cities ??
    (process.env.MEETUP_APIFY_CITY ? [process.env.MEETUP_APIFY_CITY] : null) ??
    DEFAULT_CITIES;
  const country =
    options?.country ?? process.env.MEETUP_APIFY_COUNTRY ?? DEFAULT_COUNTRY;
  const envKeywords = parseKeywordsEnv(process.env.MEETUP_APIFY_KEYWORDS);
  const keywords =
    (options?.keywords?.length ? options.keywords : envKeywords.length ? envKeywords : DEFAULT_KEYWORDS);
  const platforms =
    options?.platforms ??
    parsePlatformsEnv(process.env.MEETUP_APIFY_PLATFORMS);
  const maxItemsPerPlatform =
    options?.maxItemsPerPlatform ??
    (process.env.MEETUP_APIFY_MAX_RESULTS
      ? Number.parseInt(process.env.MEETUP_APIFY_MAX_RESULTS, 10)
      : undefined) ??
    DEFAULT_MAX_ITEMS_PER_PLATFORM;

  const dateFrom =
    options?.dateFrom ??
    new Date().toISOString().split("T")[0];
  const dateTo =
    options?.dateTo ??
    (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 2);
      return d.toISOString().split("T")[0];
    })();

  const input: Record<string, unknown> = {
    keywords,
    cities,
    country,
    platforms,
    dateFrom,
    dateTo,
    maxItemsPerPlatform: Math.max(maxItemsPerPlatform, APIFY_MIN_MAX_ITEMS_PER_PLATFORM),
    includeOnline: true,
    minAttendees: 0,
    includeFree: true,
    includePaid: true,
  };

  const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR_ID}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify API error (${res.status}): ${text}`);
  }

  const items = (await res.json()) as ApifyMeetupItem[];
  if (!Array.isArray(items)) {
    throw new Error("Apify API did not return an array of items");
  }
  const platformSet = new Set(platforms.map((p) => p.toLowerCase()));
  const filtered = items.filter(
    (item) =>
      item &&
      (item.id || item.eventUrl || item.title) &&
      (!item.platform || platformSet.has(item.platform.toLowerCase()))
  );
  // Enforce requested limit per platform (Actor may return more due to its minimum of 10).
  const byPlatform = new Map<string, ApifyMeetupItem[]>();
  for (const item of filtered) {
    const p = (item.platform ?? "unknown").toLowerCase();
    const list = byPlatform.get(p) ?? [];
    if (list.length < maxItemsPerPlatform) list.push(item);
    byPlatform.set(p, list);
  }
  return Array.from(byPlatform.values()).flat();
}
