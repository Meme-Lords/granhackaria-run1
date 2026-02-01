"use client";

import * as React from "react";

export interface CookieBannerBackdropProps {
  className?: string;
}

/**
 * Optional backdrop for the cookie banner. Currently a no-op.
 * Export kept for index compatibility.
 */
export function CookieBannerBackdrop({ className }: CookieBannerBackdropProps) {
  return null;
}
