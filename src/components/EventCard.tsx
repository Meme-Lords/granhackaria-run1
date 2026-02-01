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
  ticket_price?: string | null;
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
  ticket_price = null,
  showClock = false,
  sourceUrl = null,
}: Readonly<EventCardProps>) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const TimeIcon = showClock ? Clock : Calendar;

  const openModal = useCallback(() => setModalOpen(true), []);
  const closeModal = useCallback(() => setModalOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="flex h-full min-h-0 flex-col w-full overflow-hidden rounded-[var(--radius-m)] border border-[var(--border)] bg-[var(--card)] cursor-pointer hover:border-[var(--primary)]/50 transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2"
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
          <>
            {imageLoading ? (
              <div
                className="absolute inset-0 flex items-center justify-center z-10 bg-[var(--muted)]"
                aria-hidden
              >
                <div className="relative h-10 w-10 sm:h-12 sm:w-12">
                  <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
                  <div
                    className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"
                    aria-hidden
                  />
                </div>
              </div>
            ) : null}
            <Image
              src={imageUrl}
              alt={imageAlt || title}
              fill
              className="object-cover"
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageError(true);
                setImageLoading(false);
              }}
            />
          </>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 sm:gap-3 p-3 sm:p-4 min-h-0">
        <div className="flex items-center justify-between w-full">
          <CategoryLabel category={category} />
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            <div className="flex items-center gap-1.5">
              <TimeIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--muted-foreground)]" />
              <span className="font-secondary text-xs sm:text-[13px] font-medium text-[var(--muted-foreground)]">
                {time}
              </span>
            </div>
            {ticket_price != null && ticket_price !== "" ? (
              <span className="font-secondary text-xs sm:text-[13px] font-medium text-[var(--muted-foreground)]">
                {ticket_price}
              </span>
            ) : null}
          </div>
        </div>
        <h3 className="font-primary text-base font-semibold text-[var(--foreground)] mb-2 sm:mb-3">
          {title}
        </h3>
        {description ? (
          <p className="font-secondary text-sm text-[var(--muted-foreground)] line-clamp-4 mb-4 sm:mb-5">
            {description}
          </p>
        ) : null}
        <div className="flex items-center gap-1.5 mt-auto">
          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[var(--muted-foreground)] shrink-0" />
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
