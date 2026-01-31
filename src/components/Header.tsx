"use client";

import { CalendarDays } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "./LanguageToggle";

export function Header() {
  const { t } = useI18n();

  return (
    <header className="flex items-center justify-between h-[60px] sm:h-[70px] md:h-[80px] px-4 sm:px-6 md:px-12 w-full border-b border-[var(--border)]">
      <a href="/" className="flex items-center gap-2 sm:gap-4 hover:opacity-80 transition-opacity">
        <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[var(--primary)]" />
        <span className="font-primary text-lg sm:text-xl md:text-2xl font-semibold text-[var(--foreground)]">
          EventosGC
        </span>
      </a>
      <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
        <nav className="flex items-center gap-3 sm:gap-4 md:gap-6">
          <a
            href="/"
            className="font-secondary text-xs sm:text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity"
          >
            {t.nav.events}
          </a>
          <a
            href="/about"
            className="font-secondary text-xs sm:text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {t.nav.about}
          </a>
        </nav>
        <LanguageToggle />
      </div>
    </header>
  );
}
