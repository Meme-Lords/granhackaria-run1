import {
  Header,
  Hero,
  CategoryFilterBar,
  EventSection,
  Footer,
} from "@/components";
import {
  getTodayEvents,
  getTomorrowEvents,
  getThisWeekEvents,
} from "@/lib/queries/events";

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

  const [todayEvents, tomorrowEvents, weekEvents] = await Promise.all([
    getTodayEvents(category),
    getTomorrowEvents(category),
    getThisWeekEvents(category),
  ]);

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />
      <Hero />
      <main className="flex flex-col gap-16 sm:gap-20 md:gap-24 w-full px-4 sm:px-6 md:px-12 py-6 sm:py-8">
        <CategoryFilterBar />
        <EventSection titleKey="today" events={todayEvents} />
        <EventSection titleKey="tomorrow" events={tomorrowEvents} />
        <EventSection titleKey="thisWeek" events={weekEvents} />
      </main>
      <Footer />
    </div>
  );
}
