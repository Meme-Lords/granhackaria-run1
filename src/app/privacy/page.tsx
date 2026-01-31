import { Header, Footer } from "@/components";
import { Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-3 mb-4">
            <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--primary)]" />
            <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--foreground)]">
              Privacy Policy
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
            Introduction
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            EventosGC ("we," "our," or "us") respects your privacy and is
            committed to protecting your personal data. This privacy policy
            explains how we collect, use, and safeguard your information when
            you use our website and services.
          </p>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We're a small team of remote workers who built this platform to help
            people discover events in Las Palmas de Gran Canaria. We only
            collect what we need and we don't sell your data. Simple as that.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Information We Collect
          </h2>
          <div className="flex flex-col gap-3">
            <h3 className="font-primary text-base font-medium text-[var(--foreground)]">
              Information you provide
            </h3>
            <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
              <li>Account information (email, name) when you sign up</li>
              <li>Event preferences and saved events</li>
              <li>Communications when you contact us</li>
            </ul>
          </div>
          <div className="flex flex-col gap-3">
            <h3 className="font-primary text-base font-medium text-[var(--foreground)]">
              Information collected automatically
            </h3>
            <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
              <li>Device information (browser type, operating system)</li>
              <li>Usage data (pages visited, time spent)</li>
              <li>Location data (city-level, only with your permission)</li>
            </ul>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            How We Use Your Information
          </h2>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            <li>To provide and improve our event discovery services</li>
            <li>To personalize your experience and show relevant events</li>
            <li>To send event reminders and updates (if you opt in)</li>
            <li>To respond to your questions and support requests</li>
            <li>To analyze usage patterns and improve our platform</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Data Sharing
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We do not sell your personal information. We may share data with:
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            <li>
              Service providers who help us run our platform (hosting,
              analytics)
            </li>
            <li>Event organizers, only if you explicitly RSVP or register</li>
            <li>Legal authorities if required by law</li>
          </ul>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Cookies
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We use cookies to keep you logged in, remember your preferences, and
            understand how people use our site. You can disable cookies in your
            browser settings, but some features may not work properly.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Your Rights
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Under GDPR and other privacy laws, you have the right to:
          </p>
          <ul className="list-disc list-inside font-secondary text-sm sm:text-base text-[var(--muted-foreground)] space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your data in a portable format</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            To exercise any of these rights, email us at privacy@eventosgc.com.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Data Security
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We use industry-standard security measures to protect your data,
            including encryption in transit (HTTPS) and at rest. However, no
            system is 100% secure, so we encourage you to use strong passwords
            and be cautious online.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Data Retention
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We keep your data for as long as you have an account with us. If you
            delete your account, we'll remove your personal data within 30 days,
            except where we're required to keep it for legal reasons.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Changes to This Policy
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            We may update this policy from time to time. We'll notify you of
            significant changes by email or through a notice on our website.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="font-primary text-lg sm:text-xl font-semibold text-[var(--foreground)]">
            Contact Us
          </h2>
          <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
            Questions about this privacy policy? Reach out to us at
            privacy@eventosgc.com or find us at one of the coworking spaces in
            Las Palmas—we're usually the ones asking about weekend events.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
