"use client";

import { Sun, Sunrise, CalendarRange } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EventCard, EventCardProps } from "./EventCard";

const SECTION_ICONS = {
  today: Sun,
  tomorrow: Sunrise,
  thisWeek: CalendarRange,
} as const;

interface EventSectionProps {
  titleKey: "today" | "tomorrow" | "thisWeek";
  events: EventCardProps[];
}

export function EventSection({ titleKey, events }: EventSectionProps) {
  const { t } = useI18n();
  const Icon = SECTION_ICONS[titleKey];

  return (
    <section className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
        <h2 className="font-primary text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
          {t.sections[titleKey]}
        </h2>
      </div>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
          {events.map((event, index) => (
            <EventCard key={index} {...event} />
          ))}
        </div>
      ) : (
        <p className="font-secondary text-sm text-[var(--muted-foreground)] py-4">
          {t.sections.noEvents}
        </p>
      )}
    </section>
  );
}
