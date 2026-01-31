export function Footer() {
  return (
    <footer className="flex items-center justify-between h-[80px] px-12 w-full border-t border-[var(--border)] bg-[var(--card)]">
      <span className="font-secondary text-[13px] text-[var(--muted-foreground)]">
        © 2026 EventosGC. All rights reserved.
      </span>
      <nav className="flex items-center gap-6">
        <a
          href="#"
          className="font-secondary text-[13px] text-[var(--muted-foreground)]"
        >
          Privacy
        </a>
        <a
          href="#"
          className="font-secondary text-[13px] text-[var(--muted-foreground)]"
        >
          Terms
        </a>
        <a
          href="#"
          className="font-secondary text-[13px] text-[var(--muted-foreground)]"
        >
          Contact
        </a>
      </nav>
    </footer>
  );
}
