"use client";

import { Header, Footer } from "@/components";
import { MapPin, Users, Calendar, Heart, Sparkles, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  const features = [
    {
      icon: Calendar,
      title: t.about.features.curatedEvents.title,
      description: t.about.features.curatedEvents.description,
    },
    {
      icon: MapPin,
      title: t.about.features.localDiscovery.title,
      description: t.about.features.localDiscovery.description,
    },
    {
      icon: Users,
      title: t.about.features.communityDriven.title,
      description: t.about.features.communityDriven.description,
    },
  ];

  const stats = [
    { value: "200+", label: t.about.stats.eventsListed },
    { value: "50+", label: t.about.stats.partnerVenues },
    { value: "8", label: t.about.stats.countriesRepresented },
    { value: "2026", label: t.about.stats.founded },
  ];

  const values = [
    {
      icon: Heart,
      title: t.about.values.passionForDiscovery.title,
      description: t.about.values.passionForDiscovery.description,
    },
    {
      icon: Sparkles,
      title: t.about.values.qualityFirst.title,
      description: t.about.values.qualityFirst.description,
    },
    {
      icon: Globe,
      title: t.about.values.builtForEveryone.title,
      description: t.about.values.builtForEveryone.description,
    },
  ];

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            <span className="font-secondary text-sm sm:text-base font-medium text-[var(--muted-foreground)]">
              {t.hero.location}
            </span>
          </div>
          <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
            {t.about.heroTitle}
          </h1>
          <p className="font-secondary text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
            {t.about.heroSubtitle}
          </p>
        </div>
      </section>

      <main className="flex flex-col gap-12 sm:gap-16 md:gap-20 w-full px-4 sm:px-6 md:px-12 py-8 sm:py-12 md:py-16">
        {/* Stats Section */}
        <section className="w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center p-4 sm:p-6 rounded-[var(--radius-m)] bg-[var(--card)] border border-[var(--border)]"
              >
                <span className="font-primary text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--primary)]">
                  {stat.value}
                </span>
                <span className="font-secondary text-xs sm:text-sm text-[var(--muted-foreground)] text-center mt-1">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* What We Do Section */}
        <section className="w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            <h2 className="font-primary text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
              {t.about.whatWeDo}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col gap-3 sm:gap-4 p-4 sm:p-6 rounded-[var(--radius-m)] bg-[var(--card)] border border-[var(--border)]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[var(--color-warning)] flex items-center justify-center">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-warning-foreground)]" />
                </div>
                <h3 className="font-primary text-base sm:text-lg font-semibold text-[var(--foreground)]">
                  {feature.title}
                </h3>
                <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)]">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Story Section */}
        <section className="w-full">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
            <h2 className="font-primary text-xl sm:text-2xl font-semibold text-[var(--foreground)]">
              {t.about.ourStory}
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              {t.about.storyParagraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="flex flex-col gap-4 sm:gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-[var(--radius-m)] bg-[var(--secondary)]"
                >
                  <div className="shrink-0">
                    <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h3 className="font-primary text-sm sm:text-base font-semibold text-[var(--foreground)] mb-1">
                      {value.title}
                    </h3>
                    <p className="font-secondary text-xs sm:text-sm text-[var(--muted-foreground)]">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full">
          <div className="flex flex-col items-center text-center p-6 sm:p-8 md:p-12 rounded-[var(--radius-m)] bg-[var(--card)] border border-[var(--border)]">
            <h2 className="font-primary text-xl sm:text-2xl md:text-3xl font-bold text-[var(--foreground)] mb-3 sm:mb-4">
              {t.about.cta.title}
            </h2>
            <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] max-w-xl mb-6 sm:mb-8">
              {t.about.cta.subtitle}
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-primary text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity"
            >
              {t.about.cta.button}
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
