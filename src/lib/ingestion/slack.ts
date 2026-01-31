import { WebClient } from "@slack/web-api";

export interface SlackMessage {
  ts: string;
  text: string;
  user: string | null;
  permalink: string | null;
}

let client: WebClient | null = null;

function getClient(): WebClient | null {
  if (!client) {
    const token = process.env.SLACK_BOT_TOKEN;
    if (!token) {
      console.error("[slack] SLACK_BOT_TOKEN is not set");
      return null;
    }
    client = new WebClient(token);
  }
  return client;
}

export async function fetchChannelMessages(
  channelId: string,
  since?: Date
): Promise<SlackMessage[]> {
  const slack = getClient();
  if (!slack) return [];

  try {
    const response = await slack.conversations.history({
      channel: channelId,
      limit: 100,
      ...(since ? { oldest: String(since.getTime() / 1000) } : {}),
    });
    const messages = response.messages ?? [];

    const filtered = messages.filter(
      (msg) =>
        msg.type === "message" &&
        !msg.subtype &&
        msg.text &&
        msg.text.trim().length > 0
    );

    const results: SlackMessage[] = [];

    for (const msg of filtered) {
      let permalink: string | null = null;
      try {
        const linkResponse = await slack.chat.getPermalink({
          channel: channelId,
          message_ts: msg.ts!,
        });
        permalink = linkResponse.permalink ?? null;
      } catch {
        // permalink is optional, continue without it
      }

      results.push({
        ts: msg.ts!,
        text: msg.text!,
        user: msg.user ?? null,
        permalink,
      });
    }

    return results;
  } catch (error) {
    console.error(`[slack] Failed to fetch messages from channel ${channelId}:`, error);
    return [];
  }
}
