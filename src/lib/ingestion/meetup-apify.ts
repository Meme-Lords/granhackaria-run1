/**
 * Meetup ingestion via Apify: Event Scraper Pro (multi-platform) or filip_cicvarek/meetup-scraper (Meetup only).
 * Targets Gran Canaria; used when Meetup OAuth credentials are not set.
 * Switch with MEETUP_APIFY_ACTOR=event-scraper-pro | meetup-scraper (default: event-scraper-pro).
 */

import { keywordCategory } from "./meetup";
import type { RawEvent } from "./types";

const ACTOR_EVENT_SCRAPER_PRO = "webdatalabs~event-scraper-pro";
const ACTOR_MEETUP_SCRAPER = "filip_cicvarek~meetup-scraper";
const DEFAULT_APIFY_ACTOR = "event-scraper-pro";
const DEFAULT_CITIES = ["Las Palmas"];
const DEFAULT_COUNTRY = "ES";
const DEFAULT_MAX_ITEMS_PER_PLATFORM = 2;
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

/** filip_cicvarek/meetup-scraper output item shape (inferred from Actor). */
export interface MeetupScraperItem {
  eventId?: string;
  eventName?: string;
  eventUrl?: string;
  eventDescription?: string | null;
  eventType?: string;
  date?: string;
  address?: string | null;
  organizedByGroup?: string | null;
  groupUrlname?: string | null;
  isPaidEvent?: boolean;
  feeAmount?: number | null;
  feeCurrency?: string | null;
  feeRequired?: unknown;
  maxAttendees?: number | null;
  actualAttendees?: number;
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
 * Transform a filip_cicvarek/meetup-scraper item into RawEvent format.
 * Actor does not return image URL; image_url is null.
 */
export function transformMeetupScraperItem(item: MeetupScraperItem): RawEvent {
  const title = (item.eventName ?? "").trim() || "Untitled Event";
  const desc = item.eventDescription?.trim() ?? null;
  const combinedText = [item.eventName, item.eventDescription, item.organizedByGroup].filter(Boolean).join(" ");
  const category = keywordCategory(combinedText);

  let date_start = "";
  let time: string | null = null;
  if (item.date) {
    try {
      const date = new Date(item.date);
      date_start = date.toISOString().split("T")[0];
      time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: TIMEZONE,
      });
    } catch {
      // leave date_start empty, time null
    }
  }

  const location = item.address?.trim() || "Online";

  let ticket_price: string | null = null;
  if (item.isPaidEvent && item.feeAmount != null) {
    const curr = item.feeCurrency?.trim() || "€";
    ticket_price = `${item.feeAmount}${curr}`;
  } else if (item.feeAmount === 0 || !item.isPaidEvent) {
    ticket_price = "Free";
  }

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
    image_url: null,
    source: "meetup",
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

  const url = `https://api.apify.com/v2/acts/${ACTOR_EVENT_SCRAPER_PRO}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
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

/**
 * Which Apify Actor to use for Meetup ingestion.
 * Read from MEETUP_APIFY_ACTOR: "event-scraper-pro" (default) | "meetup-scraper".
 */
export function getApifyActor(): "event-scraper-pro" | "meetup-scraper" {
  const v = (process.env.MEETUP_APIFY_ACTOR ?? "").trim().toLowerCase();
  if (v === "meetup-scraper") return "meetup-scraper";
  return "event-scraper-pro";
}

/**
 * Fetch Meetup events from filip_cicvarek/meetup-scraper (Meetup only).
 * Uses run-sync-get-dataset-items. Requires APIFY_API_TOKEN.
 * No image URL in output; image_url will be null in RawEvent.
 */
export async function fetchMeetupEventsFromMeetupScraper(options?: {
  searchKeyword?: string;
  city?: string;
  country?: string;
  maxResults?: number;
  startDateRange?: string;
}): Promise<MeetupScraperItem[]> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    throw new Error("APIFY_API_TOKEN is not set");
  }

  const city =
    options?.city ??
    process.env.MEETUP_APIFY_CITY ??
    DEFAULT_CITIES[0];
  const country =
    options?.country ?? process.env.MEETUP_APIFY_COUNTRY ?? DEFAULT_COUNTRY;
  const envKeywords = parseKeywordsEnv(process.env.MEETUP_APIFY_KEYWORDS);
  const searchKeyword =
    options?.searchKeyword ??
    (envKeywords.length > 0 ? envKeywords[0] : "meetup");
  const maxResults =
    options?.maxResults ??
    (process.env.MEETUP_APIFY_MAX_RESULTS
      ? Number.parseInt(process.env.MEETUP_APIFY_MAX_RESULTS, 10)
      : undefined) ??
    DEFAULT_MAX_ITEMS_PER_PLATFORM;
  const startDateRange = options?.startDateRange;

  const input: Record<string, unknown> = {
    city,
    country: country.length === 2 ? country.toLowerCase() : country,
    maxResults,
    searchKeyword,
  };
  if (startDateRange != null && startDateRange !== "") {
    input.startDateRange = startDateRange;
  }

  const url = `https://api.apify.com/v2/acts/${ACTOR_MEETUP_SCRAPER}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Apify API error (${res.status}): ${text}`);
  }

  const items = (await res.json()) as MeetupScraperItem[];
  if (!Array.isArray(items)) {
    throw new Error("Apify API did not return an array of items");
  }
  return items.filter(
    (item) => item && (item.eventId || item.eventUrl || item.eventName)
  );
}
