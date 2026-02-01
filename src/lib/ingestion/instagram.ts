import type { RawInstagramPost } from "./types";

const RAPIDAPI_HOST = "instagram120.p.rapidapi.com";

/** Only fetch posts from the last N days (by post timestamp). */
const POSTS_DAYS_BACK = 3;

// Instagram120 API: POST /api/instagram/posts with body { username, maxId }
// Response shape varies by API version; we try multiple paths and timestamp formats.
interface Instagram120Post {
  id?: string;
  pk?: string;
  code?: string;
  shortcode?: string;
  caption?: { text?: string } | string;
  display_url?: string;
  image_versions2?: { candidates?: { url?: string }[] };
  taken_at?: number;
  taken_at_timestamp?: number;
  timestamp?: number;
  [key: string]: unknown;
}

type UnknownRecord = Record<string, unknown>;

function normalizeUsername(username: string): string {
  return username.replace(/^@/, "").trim();
}

/** Extract post array from various Instagram API response shapes. */
function extractPostsArray(json: UnknownRecord): Instagram120Post[] {
  const data = json.data as UnknownRecord | undefined;
  const result = json.result as UnknownRecord | Instagram120Post[] | undefined;

  // result (Instagram120: array, or object with edges[].node / items / posts)
  if (Array.isArray(result)) return result;
  if (result && typeof result === "object" && !Array.isArray(result)) {
    const r = result as UnknownRecord;
    const edges = r.edges as UnknownRecord[] | undefined;
    if (Array.isArray(edges)) {
      return edges
        .map((e) => (e as { node?: Instagram120Post }).node)
        .filter((n): n is Instagram120Post => n != null);
    }
    const fromResult = r.items ?? r.posts ?? r.data;
    const arr = Array.isArray(fromResult) ? fromResult : (fromResult as UnknownRecord)?.items;
    if (Array.isArray(arr)) return arr as Instagram120Post[];
  }

  // data.items / items / posts
  const items = (data?.items ?? json.items ?? json.posts) as Instagram120Post[] | undefined;
  if (Array.isArray(items)) return items;
  // data.edge_owner_to_timeline_media.edges[].node (GraphQL-style)
  const edges = (data?.edge_owner_to_timeline_media as UnknownRecord)?.edges as UnknownRecord[] | undefined;
  if (Array.isArray(edges)) {
    return edges
      .map((e) => (e as { node?: Instagram120Post }).node)
      .filter((n): n is Instagram120Post => n != null);
  }
  // data.user.edge_owner_to_timeline_media.edges
  const userEdges = (data?.user as UnknownRecord)?.edge_owner_to_timeline_media as UnknownRecord | undefined;
  const userEdgeList = userEdges?.edges as UnknownRecord[] | undefined;
  if (Array.isArray(userEdgeList)) {
    return userEdgeList
      .map((e) => (e as { node?: Instagram120Post }).node)
      .filter((n): n is Instagram120Post => n != null);
  }
  return [];
}

/** Get post timestamp in Unix seconds for date filtering. Handles sec, ms, or ISO string. */
function getTakenAtSeconds(post: Instagram120Post): number | null {
  const raw =
    post.taken_at ??
    post.taken_at_timestamp ??
    post.timestamp ??
    (post as { created_at?: string }).created_at;
  if (raw == null) return null;
  if (typeof raw === "number") {
    return raw < 1e12 ? raw : Math.floor(raw / 1000);
  }
  if (typeof raw === "string") {
    const ms = Date.parse(raw);
    return Number.isNaN(ms) ? null : Math.floor(ms / 1000);
  }
  return null;
}

function extractCaption(post: Instagram120Post): string | null {
  const c = post.caption;
  if (typeof c === "string") return c || null;
  if (c && typeof c === "object" && "text" in c) return (c as { text?: string }).text ?? null;
  return null;
}

function extractImageUrl(post: Instagram120Post): string | null {
  const url =
    post.display_url ??
    post.image_versions2?.candidates?.[0]?.url ??
    (post as { image_url?: string }).image_url;
  return typeof url === "string" ? url : null;
}

function postToRaw(post: Instagram120Post, index: number, username: string): RawInstagramPost {
  const id = post.id ?? post.pk ?? String(index);
  const code = post.code ?? post.shortcode ?? "";
  const cleanUsername = normalizeUsername(username);
  const sec = getTakenAtSeconds(post);
  const timestamp = sec != null
    ? new Date(sec * 1000).toISOString()
    : new Date().toISOString();
  return {
    id,
    caption: extractCaption(post),
    image_url: extractImageUrl(post),
    permalink: code
      ? `https://www.instagram.com/p/${code}/`
      : `https://www.instagram.com/${cleanUsername}/`,
    timestamp,
    username: cleanUsername,
  };
}

export async function fetchAccountPosts(
  username: string,
  count = 10
): Promise<RawInstagramPost[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  if (!apiKey) {
    console.error("[instagram] RAPIDAPI_KEY is not set");
    return [];
  }

  const cleanUsername = normalizeUsername(username);

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/api/instagram/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
      body: JSON.stringify({
        username: cleanUsername,
        maxId: "",
      }),
    });

    if (!response.ok) {
      console.error(
        `[instagram] API error for ${cleanUsername}: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const json = (await response.json()) as UnknownRecord;
    const allItems = extractPostsArray(json);

    const cutoffSec =
      Math.floor(Date.now() / 1000) - POSTS_DAYS_BACK * 24 * 60 * 60;
    const recentItems = allItems.filter((item) => {
      const sec = getTakenAtSeconds(item);
      return sec !== null && sec >= cutoffSec;
    });

    if (allItems.length > 0 && recentItems.length === 0) {
      const ts = getTakenAtSeconds(allItems[0]);
      console.warn(
        `[instagram] ${cleanUsername}: ${allItems.length} posts from API, none in last ${POSTS_DAYS_BACK} days (sample taken_at=${ts ?? "n/a"})`
      );
    }
    if (allItems.length === 0 && Object.keys(json).length > 0) {
      console.warn(
        `[instagram] ${cleanUsername}: API returned 0 posts (response has keys: ${Object.keys(json).slice(0, 5).join(", ")}${Object.keys(json).length > 5 ? "…" : ""})`
      );
    }

    return recentItems.slice(0, count).map((item, index) =>
      postToRaw(item, index, cleanUsername)
    );
  } catch (error) {
    console.error(`[instagram] Failed to fetch posts for ${cleanUsername}:`, error);
    return [];
  }
}
