"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n";

export function LocaleMetadata() {
  const { locale } = useI18n();

  useEffect(() => {
    document.documentElement.lang = locale;

    document.title = locale === "es"
      ? "EventosGC - Descubre Eventos Locales en Las Palmas"
      : "EventosGC - Discover Local Events in Las Palmas";

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        locale === "es"
          ? "Encuentra conciertos, exposiciones, talleres y más en Las Palmas de Gran Canaria"
          : "Find concerts, exhibitions, workshops and more in Las Palmas de Gran Canaria"
      );
    }
  }, [locale]);

  return null;
}
