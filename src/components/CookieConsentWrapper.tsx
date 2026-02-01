"use client";

import {
  CookieConsentProvider,
  CookieBanner,
  CookieSettings,
} from "@/components/cookie-consent";

const CONSENT_VERSION = "1.0.0";

interface CookieConsentWrapperProps {
  children: React.ReactNode;
}

export function CookieConsentWrapper({ children }: Readonly<CookieConsentWrapperProps>) {
  return (
    <CookieConsentProvider
      config={{
        consentVersion: CONSENT_VERSION,
        expirationDays: 365,
        privacyPolicyUrl: "/privacy",
        position: "bottom",
      }}
    >
      {children}
      <CookieBanner />
      <CookieSettings />
    </CookieConsentProvider>
  );
}
