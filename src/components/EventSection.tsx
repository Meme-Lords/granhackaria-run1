import { LucideIcon } from "lucide-react";
import { EventCard, EventCardProps } from "./EventCard";

interface EventSectionProps {
  icon: LucideIcon;
  title: string;
  events: EventCardProps[];
}

export function EventSection({ icon: Icon, title, events }: EventSectionProps) {
  return (
    <section className="flex flex-col gap-6 w-full">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <Icon className="w-6 h-6 text-[var(--primary)]" />
          <h2 className="font-primary text-2xl font-semibold text-[var(--foreground)]">
            {title}
          </h2>
        </div>
        <a
          href="#"
          className="font-secondary text-sm font-medium text-[var(--primary)]"
        >
          View all →
        </a>
      </div>
      <div className="grid grid-cols-3 gap-6 w-full">
        {events.map((event, index) => (
          <EventCard key={index} {...event} />
        ))}
      </div>
    </section>
  );
}
