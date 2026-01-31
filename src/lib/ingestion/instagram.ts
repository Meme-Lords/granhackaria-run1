import type { RawInstagramPost } from "./types";

const RAPIDAPI_HOST = "instagram-scraper-api2.p.rapidapi.com";

interface InstagramMediaNode {
  id: string;
  caption?: { text?: string };
  image_versions2?: { candidates?: { url: string }[] };
  code?: string;
  taken_at?: number;
}

interface InstagramApiResponse {
  data?: {
    items?: InstagramMediaNode[];
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

  try {
    const url = `https://${RAPIDAPI_HOST}/v1/posts?username_or_id_or_url=${encodeURIComponent(username)}`;

    const response = await fetch(url, {
      headers: {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": apiKey,
      },
    });

    if (!response.ok) {
      console.error(
        `[instagram] API error for ${username}: ${response.status} ${response.statusText}`
      );
      return [];
    }

    const json = (await response.json()) as InstagramApiResponse;
    const items = json.data?.items ?? [];

    return items.slice(0, count).map(
      (item): RawInstagramPost => ({
        id: item.id,
        caption: item.caption?.text ?? null,
        image_url: item.image_versions2?.candidates?.[0]?.url ?? null,
        permalink: item.code
          ? `https://www.instagram.com/p/${item.code}/`
          : `https://www.instagram.com/${username}/`,
        timestamp: item.taken_at
          ? new Date(item.taken_at * 1000).toISOString()
          : new Date().toISOString(),
        username,
      })
    );
  } catch (error) {
    console.error(`[instagram] Failed to fetch posts for ${username}:`, error);
    return [];
  }
}
