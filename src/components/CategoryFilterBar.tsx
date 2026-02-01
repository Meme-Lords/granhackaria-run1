"use client";

import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState } from "react";
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

const buttonBase =
  "relative inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full font-primary text-xs sm:text-sm transition-colors outline-none border border-[var(--border)] hover:ring-2 hover:ring-[var(--primary)]";

function getButtonClass(
  active: boolean,
): string {
  return active
    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] hover:text-[var(--accent-foreground)]";
}

export function CategoryFilterBar() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const currentCategory = searchParams.get("category") ?? null;

  const [pendingCategory, setPendingCategory] = useState<CategoryVariant | "all" | null>(null);
  const loadingCategory = isPending ? pendingCategory : null;

  const isActive = (category: CategoryVariant | "all") =>
    category === "all"
      ? currentCategory === null
      : currentCategory === category;

  const navigate = (category: CategoryVariant | "all") => {
    setPendingCategory(category);
    startTransition(() => {
      const href = category === "all" ? "/" : `/?category=${encodeURIComponent(category)}`;
      router.push(href, { scroll: false });
    });
  };

  return (
    <nav
      className="flex flex-wrap gap-2 w-full"
      aria-label={t.filter.ariaLabel}
    >
      <button
        type="button"
        onClick={() => navigate("all")}
        className={`${buttonBase} ${getButtonClass(isActive("all"))}`}
        disabled={isPending}
        aria-current={isActive("all") ? "true" : undefined}
      >
        {loadingCategory === "all" ? (
          <>
            <span className="invisible">{t.filter.all}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
            </span>
          </>
        ) : (
          t.filter.all
        )}
      </button>
      {CATEGORY_VARIANTS.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => navigate(category)}
          className={`${buttonBase} ${getButtonClass(isActive(category))}`}
          disabled={isPending}
          aria-current={isActive(category) ? "true" : undefined}
        >
          {loadingCategory === category ? (
            <>
              <span className="invisible">{t.categories[category]}</span>
              <span className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden />
              </span>
            </>
          ) : (
            t.categories[category]
          )}
        </button>
      ))}
    </nav>
  );
}
