/**
 * Thin helpers around Statsig client usage.
 *
 * Components should import from here instead of importing Statsig hooks
 * directly to:
 * - Centralize the mock/fallback behavior when Statsig is disabled
 * - Keep the usage pattern consistent across the app
 */

"use client";

import type { StatsigUser } from "@statsig/react-bindings";
import { useStatsigClient } from "@statsig/react-bindings";

export interface StatsigLikeClient {
  readonly checkGate: (gateName: string) => boolean;
  readonly logEvent: (
    eventName: string,
    value?: string | number | null,
    metadata?: Record<string, unknown>,
  ) => void;
  readonly getDynamicConfig: (configName: string) => {
    get: <T>(key: string, defaultValue: T) => T;
  };
}

const mockClient: StatsigLikeClient = {
  checkGate: () => false,
  logEvent: () => {
    // no-op when Statsig is disabled
  },
  getDynamicConfig: () => ({
    get: <T,>(_: string, defaultValue: T): T => defaultValue,
  }),
};

interface UseStatsigOptions {
  /**
   * Optional additional user attributes. For now we rely on the default
   * user object configured in the root provider, but this is available
   * for future extension.
   */
  readonly userOverride?: StatsigUser;
}

export function useSafeStatsigClient(_options?: UseStatsigOptions): StatsigLikeClient {
  try {
    const statsigContext = useStatsigClient();
    // Some versions expose the underlying client via `.client`.
    const client = (statsigContext as unknown as { client?: StatsigLikeClient }).client;

    if (!client) {
      return mockClient;
    }

    return client;
  } catch {
    // If the hook throws (e.g., provider missing or disabled), fall back.
    return mockClient;
  }
}
