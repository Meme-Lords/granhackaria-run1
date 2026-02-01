"use client";

import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n";

function isViewableSourceUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("https://") || url.startsWith("http://");
}

export interface EventImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageAlt: string;
  sourceUrl: string | null | undefined;
}

export function EventImageModal({
  isOpen,
  onClose,
  imageUrl,
  imageAlt,
  sourceUrl,
}: Readonly<EventImageModalProps>) {
  const { t } = useI18n();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const id = requestAnimationFrame(() => setImageLoaded(false));
    return () => cancelAnimationFrame(id);
  }, [isOpen, imageUrl]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const showViewOriginal = isViewableSourceUrl(sourceUrl);

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 z-50 w-full max-w-none h-full max-h-none border-0 bg-transparent p-0 overflow-auto backdrop:bg-black/70"
      aria-modal="true"
      aria-label={imageAlt}
      onCancel={onClose}
    >
      <button
        type="button"
        className="fixed inset-0 w-full h-full cursor-default border-0 p-0 z-0"
        onClick={onClose}
        aria-label={t.event.close}
      />
      <div className="fixed inset-0 flex items-center justify-center p-2 sm:p-4 pointer-events-none z-10">
        <div className="flex flex-col w-full md:w-max min-w-0 max-w-4xl max-h-[90vh] rounded-[var(--radius-m)] border border-[var(--border)] bg-[var(--card)] overflow-hidden shadow-xl pointer-events-auto">
        <div className="flex justify-end p-2 border-b border-[var(--border)]">
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            aria-label={t.event.close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="relative flex-1 min-h-0 min-w-0 flex flex-col overflow-auto">
          <div className="relative w-full min-h-[200px] min-w-[200px] bg-[var(--muted)] flex justify-center items-center">
            {!imageLoaded && (
              <div
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--muted-foreground)]"
                aria-hidden
              >
                <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" />
                <span className="font-secondary text-sm">{t.event.loading}</span>
              </div>
            )}
            {/* eslint-disable-next-line @next/next/no-img-element -- full-width modal image; aspect unknown */}
            <img
              src={imageUrl}
              alt={imageAlt}
              className={`w-full md:w-auto md:max-w-full h-auto max-h-[70vh] object-contain object-center transition-opacity duration-200 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
            />
          </div>
          {showViewOriginal && sourceUrl && (
            <div className="p-4 border-t border-[var(--border)] flex justify-center">
              <a
                href={sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex font-secondary text-sm font-medium text-[var(--primary)] hover:opacity-80 transition-opacity underline"
              >
                {t.event.viewOriginal}
              </a>
            </div>
          )}
        </div>
        </div>
      </div>
    </dialog>
  );
}
