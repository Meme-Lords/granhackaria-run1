/**
 * Meetup OAuth2 helpers for server-side token refresh.
 * Access token is used as Bearer token for GraphQL API.
 * Store MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN in env.
 */

const MEETUP_TOKEN_URL = "https://secure.meetup.com/oauth2/access";

let cachedAccessToken: string | null = null;

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  token_type: string;
}

/**
 * Exchange authorization code for access_token and refresh_token (one-time setup).
 * Use this only when obtaining the initial refresh_token via OAuth2 authorization flow.
 */
export async function exchangeCodeForTokens(
  clientId: string,
  clientSecret: string,
  redirectUri: string,
  code: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "authorization_code",
    redirect_uri: redirectUri,
    code,
  });

  const res = await fetch(MEETUP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meetup token exchange failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

/**
 * Refresh access token using refresh_token. Returns new access_token.
 * Refresh token is long-lived; store it as MEETUP_REFRESH_TOKEN.
 */
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  refreshToken: string
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(MEETUP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Meetup token refresh failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

/**
 * Get a valid Bearer access token for Meetup GraphQL API.
 * Uses cached token if available; otherwise refreshes via MEETUP_REFRESH_TOKEN.
 * Call clearAccessTokenCache() after 401 to force refresh on next getAccessToken().
 */
export async function getAccessToken(): Promise<string> {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const clientId = process.env.MEETUP_CLIENT_ID;
  const clientSecret = process.env.MEETUP_CLIENT_SECRET;
  const refreshToken = process.env.MEETUP_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "Meetup credentials not configured: set MEETUP_CLIENT_ID, MEETUP_CLIENT_SECRET, MEETUP_REFRESH_TOKEN"
    );
  }

  const data = await refreshAccessToken(clientId, clientSecret, refreshToken);
  cachedAccessToken = data.access_token;
  return cachedAccessToken;
}

/**
 * Clear cached access token (e.g. after 401). Next getAccessToken() will refresh.
 */
export function clearAccessTokenCache(): void {
  cachedAccessToken = null;
}
