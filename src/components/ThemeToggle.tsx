"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex items-center justify-center size-9 rounded-full bg-[var(--secondary)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
    >
      {theme === "dark" ? (
        <Sun className="size-4 sm:size-5" aria-hidden />
      ) : (
        <Moon className="size-4 sm:size-5" aria-hidden />
      )}
    </button>
  );
}
