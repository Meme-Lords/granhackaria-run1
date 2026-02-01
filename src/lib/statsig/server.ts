/**
 * Server-side Statsig helper for dynamic configs.
 *
 * Uses the Statsig Node server SDK (Server Core) to read dynamic configs
 * with safe fallbacks when Statsig is not configured or unavailable.
 */

import { Statsig, StatsigUser } from "@statsig/statsig-node-core";

let statsigInstance: Statsig | null = null;
let initialized = false;
let initializing: Promise<void> | null = null;

async function ensureInitialized(): Promise<void> {
  if (initialized || initializing != null) {
    await initializing;
    return;
  }

  // Read at call time so env is populated after dotenv runs (pipeline loads .env before calling us)
  const serverKey = process.env.STATSIG_SERVER_SECRET_KEY;
  if (!serverKey) {
    return;
  }

  statsigInstance = new Statsig(serverKey);

  initializing = statsigInstance
    .initialize()
    .then(() => {
      initialized = true;
    })
    .catch((error: unknown) => {
      initialized = false;
      statsigInstance = null;
      console.error("[Statsig] Server init failed:", error);
    })
    .finally(() => {
      initializing = null;
    });

  await initializing;
}

/**
 * Get a value from a Statsig dynamic config.
 * Returns fallback when Statsig is disabled or the key is missing.
 */
export async function getConfigValue<T>(
  configName: string,
  key: string,
  fallback: T,
  userId: string | null = null,
): Promise<T> {
  try {
    await ensureInitialized();

    if (!initialized || !statsigInstance) {
      return fallback;
    }

    const user = new StatsigUser({ userID: userId ?? "anonymous" });
    const config = statsigInstance.getDynamicConfig(user, configName);
    type StatsigFallback = string | number | boolean | object | any[] | null | undefined;
    const value = config.getValue(key, fallback as StatsigFallback) as T;
    return value ?? fallback;
  } catch (error) {
    console.error("[Statsig] getConfigValue failed:", { configName, key, error });
    return fallback;
  }
}

const INSTAGRAM_CONFIG_NAME = "instagram_accounts";

/**
 * Resolve Instagram usernames from Statsig dynamic config "instagram_accounts",
 * falling back to INSTAGRAM_ACCOUNTS env. Returns empty array when disabled or unset.
 */
export async function getInstagramAccountsFromStatsig(): Promise<string[]> {
  const envFallback = process.env.INSTAGRAM_ACCOUNTS ?? "";

  const enabled = await getConfigValue<boolean>(
    INSTAGRAM_CONFIG_NAME,
    "enabled",
    true,
    null,
  );
  if (!enabled) {
    return [];
  }

  const accountsStr = await getConfigValue<string>(
    INSTAGRAM_CONFIG_NAME,
    "accounts",
    envFallback,
    null,
  );
  if (!accountsStr || typeof accountsStr !== "string") {
    return [];
  }

  return accountsStr
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);
}

/**
 * Resolve "posts_days_back" from Statsig dynamic config "instagram_accounts",
 * falling back to INSTAGRAM_POSTS_DAYS_BACK env or 3. Used to filter posts by taken_at.
 */
export async function getPostsDaysBackFromStatsig(): Promise<number> {
  const envFallback = process.env.INSTAGRAM_POSTS_DAYS_BACK;
  const envNum = envFallback != null && envFallback !== "" ? Number(envFallback) : NaN;
  const fallback = Number.isFinite(envNum) && envNum > 0 ? envNum : 3;

  const value = await getConfigValue<number>(
    INSTAGRAM_CONFIG_NAME,
    "posts_days_back",
    fallback,
    null,
  );
  const n = typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
  return Math.floor(n);
}
