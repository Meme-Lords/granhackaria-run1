import { Sun, Sunrise, CalendarRange } from "lucide-react";
import { Header, Hero, EventSection, Footer, EventCardProps } from "@/components";

const todayEvents: EventCardProps[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1516275992531-b5e19d647811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "music",
    categoryLabel: "Music",
    time: "20:00",
    title: "Jazz Night at Alfredo Kraus",
    location: "Auditorio Alfredo Kraus",
    showClock: true,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1760662347435-1c0a11fea640?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "arts",
    categoryLabel: "Arts",
    time: "18:00",
    title: "Contemporary Art Exhibition",
    location: "CAAM Museum",
    showClock: false,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "food",
    categoryLabel: "Food",
    time: "12:00",
    title: "Tapas Festival at Vegueta",
    location: "Plaza Santa Ana",
    showClock: false,
  },
];

const tomorrowEvents: EventCardProps[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTB8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "sports",
    categoryLabel: "Sports",
    time: "17:00",
    title: "UD Las Palmas vs Real Madrid",
    location: "Estadio Gran Canaria",
    showClock: false,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1718781379981-bfc5640a6ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTB8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "music",
    categoryLabel: "Music",
    time: "21:30",
    title: "Canarian Folk Music Night",
    location: "Teatro Pérez Galdós",
    showClock: false,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1664768160237-069ee0f85942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTF8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "workshop",
    categoryLabel: "Workshop",
    time: "10:00",
    title: "Photography Workshop",
    location: "Casa de Colón",
    showClock: false,
  },
];

const weekEvents: EventCardProps[] = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1723551908752-2b16d5b7ab34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "festival",
    categoryLabel: "Festival",
    time: "Sat, Feb 1",
    title: "Carnival Opening Ceremony",
    location: "Parque Santa Catalina",
    showClock: false,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1755781988181-0e1d8c8e93c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "theater",
    categoryLabel: "Theater",
    time: "Sun, Feb 2",
    title: "Flamenco Dance Show",
    location: "Teatro Cuyás",
    showClock: false,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1637426992376-b8af65fb90d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    category: "market",
    categoryLabel: "Market",
    time: "Wed, Feb 5",
    title: "Farmers Market & Crafts",
    location: "Mercado del Puerto",
    showClock: false,
  },
];

export default function EventListingsPage() {
  return (
    <div className="flex flex-col min-h-full w-full bg-[var(--background)]">
      <Header />
      <Hero />
      <main className="flex flex-col gap-12 w-full px-12 py-8">
        <EventSection icon={Sun} title="Today" events={todayEvents} />
        <EventSection icon={Sunrise} title="Tomorrow" events={tomorrowEvents} />
        <EventSection icon={CalendarRange} title="This Week" events={weekEvents} />
      </main>
      <Footer />
    </div>
  );
}
