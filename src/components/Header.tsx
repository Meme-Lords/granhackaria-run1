import { CalendarDays } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between h-[60px] sm:h-[70px] md:h-[80px] px-4 sm:px-6 md:px-12 w-full border-b border-[var(--border)]">
      <div className="flex items-center gap-2 sm:gap-4">
        <CalendarDays className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[var(--primary)]" />
        <span className="font-primary text-lg sm:text-xl md:text-2xl font-semibold text-[var(--foreground)]">
          EventosGC
        </span>
      </div>
      <nav className="flex items-center gap-4 sm:gap-6">
        <a
          href="#"
          className="font-secondary text-sm font-medium text-[var(--primary)]"
        >
          Events
        </a>
        <a
          href="#"
          className="font-secondary text-sm font-medium text-[var(--muted-foreground)]"
        >
          About
        </a>
      </nav>
    </header>
  );
}
