"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import type { CategoryVariant } from "./CategoryLabel";

const CATEGORY_VARIANTS: CategoryVariant[] = [
  "music",
  "arts",
  "food",
  "sports",
  "festival",
  "theater",
  "workshop",
  "market",
];

export function CategoryFilterBar() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") ?? null;

  const isActive = (category: CategoryVariant | "all") =>
    category === "all"
      ? currentCategory === null
      : currentCategory === category;

  return (
    <nav
      className="flex flex-wrap gap-2 w-full"
      aria-label={t.filter.ariaLabel}
    >
      <Link
        href="/"
        className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full font-primary text-xs sm:text-sm transition-colors outline-none hover:ring-2 hover:ring-[var(--primary)] ${
          isActive("all")
            ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
            : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
        }`}
      >
        {t.filter.all}
      </Link>
      {CATEGORY_VARIANTS.map((category) => (
        <Link
          key={category}
          href={`/?category=${encodeURIComponent(category)}`}
          className={`inline-flex items-center justify-center gap-1 px-3 py-2 rounded-full font-primary text-xs sm:text-sm transition-colors outline-none hover:ring-2 hover:ring-[var(--primary)] ${
            isActive(category)
              ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
              : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]"
          }`}
        >
          {t.categories[category]}
        </Link>
      ))}
    </nav>
  );
}
