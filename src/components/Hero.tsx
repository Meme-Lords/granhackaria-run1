"use client";

import { MapPin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Hero() {
  const { t } = useI18n();

  return (
    <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
          <span className="font-secondary text-sm sm:text-base font-medium text-[var(--muted-foreground)]">
            {t.hero.location}
          </span>
        </div>
        <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
          {t.hero.title}
        </h1>
        <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)]">
          {t.hero.subtitle}
        </p>
      </div>
    </section>
  );
}
