"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Cookie, Settings } from "lucide-react";
import { useCookieConsent } from "./cookie-provider";

export interface CookieBannerProps {
  className?: string;
}

export function CookieBanner({ className }: CookieBannerProps) {
  const { t } = useI18n();
  const { isBannerVisible, acceptAll, rejectAll, openSettings, config } =
    useCookieConsent();

  const positionClasses = {
    bottom: "inset-x-0 bottom-0",
    top: "inset-x-0 top-0",
    "bottom-left": "bottom-4 left-4 max-w-md",
    "bottom-right": "bottom-4 right-4 max-w-md",
  };

  const position = config.position ?? "bottom";

  return (
    <AnimatePresence>
      {isBannerVisible && (
        <motion.div
          initial={{ y: position.includes("top") ? -100 : 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position.includes("top") ? -100 : 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className={cn("fixed z-50 p-4", positionClasses[position], className)}
        >
          <div
            className={cn(
              "bg-card border border-border rounded-lg shadow-lg",
              position === "bottom" || position === "top"
                ? "mx-auto max-w-5xl"
                : ""
            )}
          >
            <div className="p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Cookie className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {t.cookieBanner.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
                      {t.cookieBanner.description}{" "}
                      {config.privacyPolicyUrl && (
                        <a
                          href={config.privacyPolicyUrl}
                          className="underline underline-offset-4 hover:text-foreground transition-colors"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {t.cookieBanner.learnMore}
                        </a>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openSettings}
                    className="gap-2 bg-transparent"
                    aria-label={t.cookieBanner.customize}
                  >
                    <Settings className="h-4 w-4" />
                    {t.cookieBanner.customize}
                  </Button>
                  <Button variant="outline" size="sm" onClick={rejectAll} className="bg-transparent">
                    {t.cookieBanner.rejectAll}
                  </Button>
                  <Button size="sm" onClick={acceptAll}>
                    {t.cookieBanner.acceptAll}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
