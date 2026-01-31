import Image from "next/image";
import { Clock, Calendar, MapPin } from "lucide-react";
import { CategoryLabel, CategoryVariant } from "./CategoryLabel";

export interface EventCardProps {
  imageUrl: string;
  imageAlt?: string;
  category: CategoryVariant;
  categoryLabel: string;
  time: string;
  title: string;
  location: string;
  showClock?: boolean;
}

export function EventCard({
  imageUrl,
  imageAlt = "",
  category,
  categoryLabel,
  time,
  title,
  location,
  showClock = false,
}: EventCardProps) {
  const TimeIcon = showClock ? Clock : Calendar;

  return (
    <article className="flex flex-col w-full overflow-hidden rounded-[var(--radius-m)] border border-[var(--border)] bg-[var(--card)]">
      <div className="relative w-full h-[160px]">
        <Image
          src={imageUrl}
          alt={imageAlt || title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between w-full">
          <CategoryLabel category={category} label={categoryLabel} />
          <div className="flex items-center gap-1.5">
            <TimeIcon className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
            <span className="font-secondary text-[13px] font-medium text-[var(--muted-foreground)]">
              {time}
            </span>
          </div>
        </div>
        <h3 className="font-primary text-base font-semibold text-[var(--foreground)]">
          {title}
        </h3>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <span className="font-secondary text-[13px] text-[var(--muted-foreground)]">
            {location}
          </span>
        </div>
      </div>
    </article>
  );
}
