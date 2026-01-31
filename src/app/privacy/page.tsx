"use client";

import { Header, Footer } from "@/components";
import { Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function PrivacyPage() {
  const { t } = useI18n();
  const s = t.privacy.sections;

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
            <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              {t.privacy.title}
            </h1>
          </div>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)]">
            {t.privacy.lastUpdated}
          </p>
        </div>
      </section>

      <main className="flex flex-col gap-8 sm:gap-10 w-full max-w-3xl px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.introduction.title}
          </h2>
          {s.introduction.content.map((paragraph, index) => (
            <p
              key={index}
              className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed"
            >
              {paragraph}
            </p>
          ))}
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.informationCollected.title}
          </h2>
          <div className="flex flex-col gap-3">
            <h3 className="font-primary text-base font-medium text-[var(--foreground)]">
              {s.informationCollected.youProvide}
            </h3>
            <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
              {s.informationCollected.youProvideItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-primary text-base font-medium text-[var(--foreground)]">
              {s.informationCollected.automatic}
            </h3>
            <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
              {s.informationCollected.automaticItems.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.howWeUse.title}
          </h2>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            {s.howWeUse.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.dataSharing.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.dataSharing.content}
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            {s.dataSharing.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.cookies.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.cookies.content}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.yourRights.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.yourRights.content}
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            {s.yourRights.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.yourRights.contact}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.dataSecurity.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.dataSecurity.content}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.dataRetention.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.dataRetention.content}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.changes.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.changes.content}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.contactUs.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.contactUs.content}
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
