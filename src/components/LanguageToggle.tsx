"use client";

import { useI18n } from "@/lib/i18n";

export function LanguageToggle() {
  const { locale, setLocale } = useI18n();

  return (
    <div className="flex items-center gap-1 rounded-full bg-[var(--secondary)] p-1">
      <button
        onClick={() => setLocale("en")}
        className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors ${
          locale === "en"
            ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLocale("es")}
        className={`px-2 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors ${
          locale === "es"
            ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm"
            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
        }`}
      >
        ES
      </button>
    </div>
  );
}
