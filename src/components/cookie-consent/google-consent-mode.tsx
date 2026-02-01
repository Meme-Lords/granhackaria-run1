"use client";

import * as React from "react";

export interface GoogleConsentModeProps {
  defaults: {
    analytics_storage?: "granted" | "denied";
    ad_storage?: "granted" | "denied";
    ad_user_data?: "granted" | "denied";
    ad_personalization?: "granted" | "denied";
  };
  regions?: string[];
}

/**
 * Sets Google Consent Mode v2 default state before or when gtag loads.
 * Renders nothing. When gtag is available, updates consent state.
 */
export function GoogleConsentMode({ defaults }: GoogleConsentModeProps) {
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: (a: string, b: string, c: object) => void }).gtag;
    if (typeof gtag !== "function") return;
    gtag("consent", "default", {
      analytics_storage: defaults.analytics_storage ?? "denied",
      ad_storage: defaults.ad_storage ?? "denied",
      ad_user_data: defaults.ad_user_data ?? "denied",
      ad_personalization: defaults.ad_personalization ?? "denied",
    });
  }, [defaults.analytics_storage, defaults.ad_storage, defaults.ad_user_data, defaults.ad_personalization]);

  return null;
}
