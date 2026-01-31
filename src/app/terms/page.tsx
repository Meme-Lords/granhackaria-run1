import { Header, Footer } from "@/components";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
            <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Terms of Service
            </h1>
          </div>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)]">
            Last updated: January 2026
          </p>
        </div>
      </section>

      <main className="flex flex-col gap-8 sm:gap-10 w-full max-w-3xl px-4 sm:px-6 md:px-12 py-8 sm:py-12">
        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Agreement to Terms
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            By accessing or using EventosGC, you agree to be bound by these
            Terms of Service. If you disagree with any part of the terms, you
            may not access our service.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We've tried to keep these terms readable and fair. If something
            doesn't make sense, reach out and we'll explain.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            What We Provide
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            EventosGC is an event discovery platform for Las Palmas de Gran
            Canaria. We aggregate and display information about local events
            including concerts, exhibitions, workshops, festivals, and other
            activities.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We are not the organizers of these events. We provide information to
            help you discover what's happening, but the events themselves are
            run by third parties.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            User Accounts
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            To access certain features, you may need to create an account. When
            you do:
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            <li>Provide accurate and complete information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized access</li>
            <li>You're responsible for all activity under your account</li>
          </ul>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            You must be at least 16 years old to create an account.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Acceptable Use
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            You agree not to:
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            <li>Use the service for any illegal purpose</li>
            <li>Post false, misleading, or spam content</li>
            <li>Scrape or harvest data without permission</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with other users' enjoyment of the service</li>
            <li>Impersonate others or misrepresent your affiliation</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Event Information
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We strive to provide accurate event information, but we can't
            guarantee that all details are correct or up-to-date. Events may be
            cancelled, rescheduled, or changed without notice by the organizers.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Always verify important details (time, location, tickets) with the
            event organizer before attending. We are not responsible for
            inaccurate information or changes made by event organizers.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Intellectual Property
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            The EventosGC name, logo, and original content are owned by us. You
            may not use our branding without permission.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Event information, images, and descriptions may be owned by the
            respective event organizers and venues. We display this content
            under fair use or with permission.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Third-Party Links
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Our service may contain links to third-party websites or services
            (ticketing platforms, venue websites, etc.). We are not responsible
            for the content or practices of these external sites.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Limitation of Liability
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            EventosGC is provided "as is" without warranties of any kind. To the
            fullest extent permitted by law, we disclaim all warranties, express
            or implied.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We are not liable for any damages arising from your use of the
            service, including but not limited to: missed events, incorrect
            information, or issues with third-party event organizers.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Termination
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We may suspend or terminate your account at any time for violations
            of these terms or for any other reason at our discretion. You may
            also delete your account at any time through your account settings.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Changes to Terms
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We may update these terms from time to time. We'll notify you of
            significant changes by email or through a notice on our website.
            Continued use of the service after changes constitutes acceptance of
            the new terms.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Governing Law
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            These terms are governed by the laws of Spain. Any disputes will be
            resolved in the courts of Las Palmas de Gran Canaria.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Contact Us
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Questions about these terms? Reach out at legal@eventosgc.com. We're
            real people and we're happy to clarify anything.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
