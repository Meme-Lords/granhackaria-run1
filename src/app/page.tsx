import {
  Header,
  Hero,
  StaticBackground,
  CategoryFilterBar,
  EventSection,
  GoToTopButton,
  Footer,
} from "@/components";
import {
  getTodayEvents,
  getTomorrowEvents,
  getThisWeekEvents,
} from "@/lib/queries/events";
import { getLocaleFromCookies } from "@/lib/i18n/server";

interface EventListingsPageProps {
  readonly searchParams: Promise<{
    readonly [key: string]: string | string[] | undefined;
  }>;
}

export default async function EventListingsPage({
  searchParams,
}: EventListingsPageProps) {
  const params = await searchParams;
  const category =
    typeof params.category === "string" ? params.category : undefined;
  const locale = await getLocaleFromCookies();

  const [todayEvents, tomorrowEvents, weekEvents] = await Promise.all([
    getTodayEvents(locale, category),
    getTomorrowEvents(locale, category),
    getThisWeekEvents(locale, category),
  ]);

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />
      <Hero />
      <main className="relative flex flex-col gap-16 sm:gap-20 md:gap-24 w-full px-4 sm:px-6 md:px-12 py-6 sm:py-8 min-h-[400px] overflow-hidden">
        <StaticBackground fixed={false} />
        <div className="relative z-10 flex flex-col gap-16 sm:gap-20 md:gap-24 w-full">
          <CategoryFilterBar />
          <EventSection titleKey="today" events={todayEvents} />
          <EventSection titleKey="tomorrow" events={tomorrowEvents} />
          <EventSection titleKey="thisWeek" events={weekEvents} />
          <GoToTopButton />
        </div>
      </main>
      <Footer />
    </div>
  );
}
