/**
 * Meetup.com GraphQL API client and event transformation.
 * Fetches upcoming events for Gran Canaria (lat/lon + radius) and transforms to RawEvent.
 */

import { getAccessToken, clearAccessTokenCache } from "@/lib/meetup/auth";
import type { RawEvent } from "./types";

const MEETUP_GRAPHQL_URL = "https://api.meetup.com/gql";
const GRAN_CANARIA_LAT = 27.9202;
const GRAN_CANARIA_LON = -15.5474;
const DEFAULT_RADIUS_KM = 50;
const DEFAULT_FIRST = 50;
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

// Raw Meetup API response shape (eventsSearch.edges[].node)
export interface RawMeetupEvent {
  id: string;
  title: string;
  description: string | null;
  dateTime: string | null;
  duration: number | null;
  eventUrl: string | null;
  going?: number | null;
  featuredEventPhoto?: { id?: string; baseUrl?: string } | null;
  venue?: {
    id?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    lat?: number;
    lng?: number;
  } | null;
  group?: { id?: string; name?: string; urlname?: string } | null;
}

const CATEGORY_KEYWORDS: Record<RawEvent["category"], string[]> = {
  music: ["music", "concert", "dj", "band", "live music", "karaoke", "jazz", "salsa", "música"],
  arts: ["art", "gallery", "exhibition", "painting", "photography", "creative", "arte", "foto"],
  food: ["food", "cooking", "cuisine", "restaurant", "tasting", "tapas", "comida", "gastronomía"],
  sports: ["sport", "fitness", "running", "hiking", "yoga", "cycling", "deporte", "senderismo"],
  festival: ["festival", "celebration", "carnival", "fiesta", "party"],
  theater: ["theater", "theatre", "play", "performance", "drama", "teatro"],
  workshop: ["workshop", "class", "training", "learning", "course", "seminar", "networking", "taller"],
  market: ["market", "fair", "bazaar", "flea market", "artisan", "mercado", "feria"],
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function keywordCategory(text: string): RawEvent["category"] {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category as RawEvent["category"];
    }
  }
  return "workshop";
}

/**
 * Transform a Meetup API event node into RawEvent format.
 * Uses keyword-based category mapping. Handles missing venue (Online), missing image, missing description.
 */
export function transformMeetupEvent(node: RawMeetupEvent): RawEvent {
  const title = (node.title ?? "").trim() || "Untitled Event";
  const desc = node.description?.trim() ?? null;
  const combinedText = [node.title, node.description, node.group?.name].filter(Boolean).join(" ");
  const category = keywordCategory(combinedText);

  let date_start = "";
  let time: string | null = null;
  if (node.dateTime) {
    try {
      const date = new Date(node.dateTime);
      date_start = date.toISOString().split("T")[0];
      time = date.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Atlantic/Canary",
      });
    } catch {
      // leave date_start empty, time null
    }
  }

  let location = "Online";
  if (node.venue?.name || node.venue?.address || node.venue?.city) {
    const parts = [
      node.venue.name,
      node.venue.address,
      node.venue.city,
      node.venue.state,
      node.venue.country,
    ].filter(Boolean);
    location = parts.join(", ");
  }

  const image_url = node.featuredEventPhoto?.baseUrl ?? null;
  const source_url = node.eventUrl ?? null;

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
    ticket_price: null,
    category,
    image_url,
    source: "meetup",
    source_url,
  };
}

const EVENTS_SEARCH_QUERY = `
query MeetupEventsSearch($lat: Float!, $lon: Float!, $radius: Int!, $first: Int!) {
  eventsSearch(input: {
    first: $first
    filter: {
      status: UPCOMING
      lat: $lat
      lon: $lon
      radius: $radius
    }
  }) {
    totalCount
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        title
        description
        dateTime
        duration
        eventUrl
        going
        featuredEventPhoto { id baseUrl }
        venue { id name address city state country lat lng }
        group { id name urlname }
      }
    }
  }
}
`;

interface MeetupGraphQLResponse {
  data?: {
    eventsSearch?: {
      edges: Array<{ node: RawMeetupEvent }>;
      pageInfo?: { hasNextPage?: boolean; endCursor?: string };
    };
  };
  errors?: Array<{ message: string }>;
}

async function meetupGraphQLRequest<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(MEETUP_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 401) {
    clearAccessTokenCache();
    throw new Error("Meetup API unauthorized (401); token refreshed for next request");
  }

  if (res.status === 429) {
    throw new Error("Meetup API rate limited (429)");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meetup API error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as MeetupGraphQLResponse;
  if (json.errors?.length) {
    throw new Error(`Meetup GraphQL errors: ${json.errors.map((e) => e.message).join(", ")}`);
  }

  return json as T;
}

/**
 * Fetch upcoming Meetup events for Gran Canaria (lat/lon + radius).
 * Uses OAuth2 Bearer token, retries on 429 with exponential backoff.
 */
export async function fetchMeetupEvents(
  options: {
    lat?: number;
    lon?: number;
    radiusKm?: number;
    first?: number;
  } = {}
): Promise<RawMeetupEvent[]> {
  const lat = options.lat ?? GRAN_CANARIA_LAT;
  const lon = options.lon ?? GRAN_CANARIA_LON;
  const radius = options.radiusKm ?? DEFAULT_RADIUS_KM;
  const first = options.first ?? DEFAULT_FIRST;

  let lastError: Error | null = null;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await meetupGraphQLRequest<MeetupGraphQLResponse>(
        EVENTS_SEARCH_QUERY,
        { lat, lon, radius, first }
      );

      const edges = response.data?.eventsSearch?.edges ?? [];
      return edges.map((e) => e.node).filter((n) => n.id && n.title);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (lastError.message.includes("429") && attempt < MAX_RETRIES - 1) {
        const waitMs = INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        console.warn(`[meetup] Rate limited, waiting ${waitMs}ms before retry ${attempt + 1}/${MAX_RETRIES}`);
        await sleep(waitMs);
        continue;
      }
      throw lastError;
    }
  }

  throw lastError ?? new Error("Meetup fetch failed");
}
