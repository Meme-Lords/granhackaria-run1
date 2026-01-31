import { CalendarDays } from "lucide-react";

export function Header() {
  return (
    <header className="flex items-center justify-between h-[80px] px-12 w-full border-b border-[var(--border)]">
      <div className="flex items-center gap-4">
        <CalendarDays className="w-8 h-8 text-[var(--primary)]" />
        <span className="font-primary text-2xl font-semibold text-[var(--foreground)]">
          EventosGC
        </span>
      </div>
      <nav className="flex items-center gap-6">
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
