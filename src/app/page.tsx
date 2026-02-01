import { Header, Hero, EventSection, Footer } from "@/components";
import {
  getTodayEvents,
  getTomorrowEvents,
  getThisWeekEvents,
} from "@/lib/queries/events";

export default async function EventListingsPage() {
  const [todayEvents, tomorrowEvents, weekEvents] = await Promise.all([
    getTodayEvents(),
    getTomorrowEvents(),
    getThisWeekEvents(),
  ]);

  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />
      <Hero />
      <main className="flex flex-col gap-16 sm:gap-20 md:gap-24 w-full px-4 sm:px-6 md:px-12 py-6 sm:py-8">
        <EventSection titleKey="today" events={todayEvents} />
        <EventSection titleKey="tomorrow" events={tomorrowEvents} />
        <EventSection titleKey="thisWeek" events={weekEvents} />
      </main>
      <Footer />
    </div>
  );
}
