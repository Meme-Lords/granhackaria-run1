export function Footer() {
  return (
    <footer className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 sm:h-[80px] px-4 sm:px-6 md:px-12 w-full border-t border-[var(--border)] bg-[var(--card)]">
      <span className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)] text-center sm:text-left">
        © 2026 EventosGC. All rights reserved.
      </span>
      <nav className="flex items-center gap-4 sm:gap-6">
        <a
          href="/privacy"
          className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Privacy
        </a>
        <a
          href="/terms"
          className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Terms
        </a>
        <a
          href="mailto:hello@eventosgc.com"
          className="font-secondary text-xs sm:text-[13px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
        >
          Contact
        </a>
      </nav>
    </footer>
  );
}
