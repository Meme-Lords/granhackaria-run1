import { LucideIcon } from "lucide-react";
import { EventCard, EventCardProps } from "./EventCard";

interface EventSectionProps {
  icon: LucideIcon;
  title: string;
  events: EventCardProps[];
}

export function EventSection({ icon: Icon, title, events }: EventSectionProps) {
  return (
    <section className="flex flex-col gap-4 sm:gap-6 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2 sm:gap-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
          <h2 className="font-primary text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
        </div>
        <a
          href="#"
          className="font-secondary text-xs sm:text-sm font-medium text-[var(--primary)]"
        >
          View all →
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
