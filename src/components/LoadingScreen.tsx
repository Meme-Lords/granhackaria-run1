"use client";

/**
 * Full-screen loading overlay with an orange spinner.
 * Used for route transitions and initial load (no Lottie).
 */
export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)]">
      <div className="relative h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-[var(--border)]" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"
          aria-hidden
        />
      </div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
