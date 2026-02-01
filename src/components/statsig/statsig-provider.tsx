/**
 * StatsigProvider wrapper for client-side feature flags and dynamic configs.
 *
 * Design goals:
 * - Single place where the Statsig SDK is initialized
 * - Safe fallbacks when Statsig is disabled or misconfigured
 * - Minimal bundle impact for components consuming feature flags/configs
 */

"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { StatsigProvider, useClientAsyncInit } from "@statsig/react-bindings";

interface StatsigRootProviderProps {
  readonly children: ReactNode;
}

const STATSIG_CLIENT_KEY = process.env.NEXT_PUBLIC_STATSIG_CLIENT_KEY;

function StatsigEnabled({ children }: StatsigRootProviderProps) {
  const user = useMemo(
    () => ({
      // NOTE: This is intentionally generic; call sites can later
      // extend this by passing custom user attributes via overrides.
      userID: "anonymous",
    }),
    [],
  );

  const { client } = useClientAsyncInit(
    STATSIG_CLIENT_KEY ?? "",
    user,
    {
      // Keep configuration minimal for now; plugins like web analytics
      // and session replay can be added later if needed.
    },
  );

  // If Statsig failed to produce a client, render children without gating.
  // As soon as a client exists, enable the provider even if isLoading is true,
  // since our consumers use safe defaults for configs/gates.
  if (client == null) {
    return <>{children}</>;
  }

  return <StatsigProvider client={client}>{children}</StatsigProvider>;
}

export function StatsigRootProvider({ children }: StatsigRootProviderProps) {
  // Hard disable switch via env var. When set to "true", we avoid
  // initializing the SDK entirely to keep bundle/runtime overhead minimal.
  const isDisabled = process.env.NEXT_PUBLIC_DISABLE_STATSIG === "true";

  if (isDisabled || STATSIG_CLIENT_KEY == null || STATSIG_CLIENT_KEY === "") {
    return <>{children}</>;
  }

  return <StatsigEnabled>{children}</StatsigEnabled>;
}
