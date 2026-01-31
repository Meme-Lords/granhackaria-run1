import { Header, Footer } from "@/components";
import { MapPin, Users, Calendar, Heart, Sparkles, Globe } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Curated Events",
    description:
      "We handpick the best concerts, exhibitions, workshops, and festivals happening across the island.",
  },
  {
    icon: MapPin,
    title: "Local Discovery",
    description:
      "From Vegueta's historic plazas to Las Canteras beachfront venues, discover events in every corner of the city.",
  },
  {
    icon: Users,
    title: "Community Driven",
    description:
      "Built by remote workers who fell in love with Gran Canaria. We know what it's like to arrive somewhere new and want to connect.",
  },
];

const stats = [
  { value: "200+", label: "Events Listed" },
  { value: "50+", label: "Partner Venues" },
  { value: "8", label: "Countries Represented" },
  { value: "2026", label: "Founded" },
];

const values = [
  {
    icon: Heart,
    title: "Passion for Discovery",
    description:
      "We believe the best way to experience a new place is through its culture, music, and people.",
  },
  {
    icon: Sparkles,
    title: "Quality First",
    description:
      "Every event is verified to ensure you have accurate information and a great experience.",
  },
  {
    icon: Globe,
    title: "Built for Everyone",
    description:
      "Whether you're a digital nomad, expat, tourist, or local—we help you find your community.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />

      {/* Hero Section */}
      <section className="w-full bg-[var(--card)] p-4 sm:p-8 md:p-12 lg:p-16">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
            <span className="font-secondary text-sm sm:text-base font-medium text-[var(--muted-foreground)]">
              Las Palmas de Gran Canaria
            </span>
          </div>
          <h1 className="font-primary text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--foreground)] mb-4">
            Helping You Feel at Home in Gran Canaria
          </h1>
          <p className="font-secondary text-base sm:text-lg text-[var(--muted-foreground)] leading-relaxed">
            EventosGC is built by remote workers and digital nomads who landed
            in Las Palmas and wanted to do more than just work from cafés. From
            jazz nights at the Alfredo Kraus Auditorium to tapas festivals in
            Vegueta, we help you find experiences that turn a new city into home.
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
              What We Do
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
              Our Story
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex flex-col gap-4 sm:gap-6">
              <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                EventosGC started at a coworking space in Las Palmas. A group of
                us—remote workers and digital nomads from different corners of
                the world—kept having the same conversation: "Did you hear about
                that concert last week?" Always last week. Always too late.
              </p>
              <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                In 2026, we decided to fix that. We built EventosGC to be the
                guide we wished we had when we first arrived. Not just a
                calendar, but a way to actually connect with the island—its
                music, food, art, and people.
              </p>
              <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
                We're not locals, but Gran Canaria has become home. And we want
                to help others—whether you're here for a month or a decade—feel
                the same way.
              </p>
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
              Ready to Explore?
            </h2>
            <p className="font-secondary text-sm sm:text-base text-[var(--muted-foreground)] max-w-xl mb-6 sm:mb-8">
              Close the laptop, step outside, and discover what's happening in
              Las Palmas today. Your next favorite memory is just a click away.
            </p>
            <a
              href="/"
              className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] font-primary text-sm sm:text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Events
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
