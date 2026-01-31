"use client";

import { LucideIcon } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { EventCard, EventCardProps } from "./EventCard";

interface EventSectionProps {
  icon: LucideIcon;
  titleKey: "today" | "tomorrow" | "thisWeek";
  events: EventCardProps[];
}

export function EventSection({ icon: Icon, titleKey, events }: EventSectionProps) {
  const { t } = useI18n();

  return (
    <section className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
          <h2 className="font-primary text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
            {t.sections[titleKey]}
          </h2>
        </div>
        <a
          href="#"
          className="font-secondary text-xs sm:text-sm font-medium text-[var(--primary)]"
        >
          {t.sections.viewAll}
        </a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
        {events.map((event, index) => (
          <EventCard key={index} {...event} />
        ))}
      </div>
    </section>
  );
}
