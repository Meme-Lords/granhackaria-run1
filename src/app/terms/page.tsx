"use client";

import { Header, Footer } from "@/components";
import { FileText } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function TermsPage() {
  const { t } = useI18n();
  const s = t.terms.sections;

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
            <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              {t.terms.title}
            </h1>
          </div>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)]">
            {t.terms.lastUpdated}
          </p>
        </div>
      </section>

      <main className="flex flex-col gap-8 sm:gap-10 w-full max-w-3xl px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.agreement.title}
          </h2>
          {s.agreement.content.map((paragraph, index) => (
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
            {s.whatWeProvide.title}
          </h2>
          {s.whatWeProvide.content.map((paragraph, index) => (
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
            {s.userAccounts.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.userAccounts.content}
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            {s.userAccounts.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.userAccounts.ageRequirement}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.acceptableUse.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.acceptableUse.content}
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            {s.acceptableUse.items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.eventInformation.title}
          </h2>
          {s.eventInformation.content.map((paragraph, index) => (
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
            {s.intellectualProperty.title}
          </h2>
          {s.intellectualProperty.content.map((paragraph, index) => (
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
            {s.thirdPartyLinks.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.thirdPartyLinks.content}
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            {s.liability.title}
          </h2>
          {s.liability.content.map((paragraph, index) => (
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
            {s.termination.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.termination.content}
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
            {s.governingLaw.title}
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            {s.governingLaw.content}
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
