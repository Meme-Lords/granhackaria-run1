"use client";

import { useI18n } from "@/lib/i18n";

export type CategoryVariant =
  | "music"
  | "arts"
  | "food"
  | "sports"
  | "festival"
  | "theater"
  | "workshop"
  | "market";

interface CategoryLabelProps {
  category: CategoryVariant;
}

const categoryStyles: Record<
  CategoryVariant,
  { bg: string; text: string }
> = {
  music: {
    bg: "bg-[var(--color-warning)]",
    text: "text-[var(--color-warning-foreground)]",
  },
  arts: {
    bg: "bg-[var(--color-info)]",
    text: "text-[var(--color-info-foreground)]",
  },
  food: {
    bg: "bg-[var(--color-success)]",
    text: "text-[var(--color-success-foreground)]",
  },
  sports: {
    bg: "bg-[var(--secondary)]",
    text: "text-[var(--secondary-foreground)]",
  },
  festival: {
    bg: "bg-[var(--color-success)]",
    text: "text-[var(--color-success-foreground)]",
  },
  theater: {
    bg: "bg-[var(--color-info)]",
    text: "text-[var(--color-info-foreground)]",
  },
  workshop: {
    bg: "bg-[var(--color-info)]",
    text: "text-[var(--color-info-foreground)]",
  },
  market: {
    bg: "bg-[var(--secondary)]",
    text: "text-[var(--secondary-foreground)]",
  },
};

export function CategoryLabel({ category }: CategoryLabelProps) {
  const { t } = useI18n();
  const styles = categoryStyles[category];
  const label = t.categories[category];

  return (
    <span
      className={`inline-flex items-center justify-center gap-1 px-2 py-1.5 sm:py-2 rounded-full font-primary text-xs sm:text-sm ${styles.bg} ${styles.text}`}
    >
      {label}
    </span>
  );
}
