"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { Clock, Calendar, MapPin, ImageOff } from "lucide-react";
import { CategoryLabel, CategoryVariant } from "./CategoryLabel";
import { EventImageModal } from "./EventImageModal";

export interface EventCardProps {
  imageUrl: string;
  imageAlt?: string;
  category: CategoryVariant;
  time: string;
  title: string;
  description?: string | null;
  location: string;
  showClock?: boolean;
  sourceUrl?: string | null;
}

export function EventCard({
  imageUrl,
  imageAlt = "",
  category,
  time,
  title,
  description,
  location,
  showClock = false,
  sourceUrl = null,
}: Readonly<EventCardProps>) {
  const [imageError, setImageError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const TimeIcon = showClock ? Clock : Calendar;

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex flex-col w-full overflow-hidden rounded-[var(--radius-m)] border border-[var(--border)] bg-[var(--card)] cursor-pointer hover:border-[var(--primary)]/50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
        aria-label={title}
      >
        <div className="relative w-full h-[140px] sm:h-[160px] bg-[var(--muted)]">
        {imageError ? (
          <div
            className="absolute inset-0 flex items-center justify-center text-[var(--muted-foreground)]"
            aria-hidden
          >
            <ImageOff className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt={imageAlt || title}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
          />
        )}
      </div>
      <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">
        <div className="flex items-center justify-between w-full">
          <CategoryLabel category={category} />
          <div className="flex items-center gap-1.5">
            <TimeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--muted-foreground)]" />
            <span className="font-secondary text-xs sm:text-[13px] font-medium text-[var(--muted-foreground)]">
              {time}
            </span>
          </div>
        </div>
        <h3 className="font-primary text-sm sm:text-base font-semibold text-[var(--foreground)]">
          {title}
        </h3>
        {description ? (
          <p className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)] line-clamp-2">
            {description}
          </p>
        ) : null}
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--muted-foreground)]" />
          <span className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)]">
            {location}
          </span>
        </div>
      </div>
    </button>

      <EventImageModal
        isOpen={modalOpen}
        onClose={closeModal}
        imageUrl={imageUrl}
        imageAlt={imageAlt || title}
        sourceUrl={sourceUrl}
      />
    </>
  );
}
