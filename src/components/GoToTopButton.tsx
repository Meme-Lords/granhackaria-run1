"use client";

import { ArrowUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function GoToTopButton() {
  const { t } = useI18n();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex justify-center w-full pt-4 pb-2">
      <button
        type="button"
        onClick={scrollToTop}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-primary text-sm font-medium border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        aria-label={t.feed.goToTop}
      >
        <ArrowUp className="w-4 h-4 shrink-0" aria-hidden />
        {t.feed.goToTop}
      </button>
    </div>
  );
}
