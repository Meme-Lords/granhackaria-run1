/**
 * Seed script for events table.
 * Run with: npx tsx src/lib/supabase/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY)
 * in .env or .env.local.
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load .env then .env.local (local overrides). Either file can hold Supabase credentials.
config({ path: ".env" });
config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in .env or .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper to get dates relative to today
function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function getNextDayOfWeek(dayOfWeek: number): string {
  const d = new Date();
  const currentDay = d.getDay();
  let daysAhead = dayOfWeek - currentDay;
  if (daysAhead <= 0) daysAhead += 7;
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split("T")[0];
}

const today = getToday();
const tomorrow = getTomorrow();
const saturday = getNextDayOfWeek(6); // Saturday
const sunday = getNextDayOfWeek(0); // Sunday
const wednesday = getNextDayOfWeek(3); // Wednesday

type EventSeed = {
  title: string;
  description: string | null;
  date_start: string;
  date_end: string | null;
  time: string | null;
  location: string;
  category: string;
  ticket_price: string | null;
  image_url: string;
  source: string;
  source_url: string;
};

const events: EventSeed[] = [
  // Today events
  {
    title: "Jazz Night at Alfredo Kraus",
    description:
      "An evening of live jazz at the iconic Alfredo Kraus Auditorium.",
    date_start: today,
    date_end: null,
    time: "20:00",
    location: "Auditorio Alfredo Kraus",
    category: "music",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1516275992531-b5e19d647811?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://jazz-night-alfredo-kraus",
  },
  {
    title: "Contemporary Art Exhibition",
    description:
      "Explore contemporary works from Canarian and international artists.",
    date_start: today,
    date_end: null,
    time: "18:00",
    location: "CAAM Museum",
    category: "arts",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1760662347435-1c0a11fea640?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://contemporary-art-exhibition",
  },
  {
    title: "Tapas Festival at Vegueta",
    description:
      "Sample the best tapas from local restaurants in the heart of Vegueta.",
    date_start: today,
    date_end: null,
    time: "12:00",
    location: "Plaza Santa Ana",
    category: "food",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1763621470208-efe14b618119?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0MDZ8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://tapas-festival-vegueta",
  },
  // Tomorrow events
  {
    title: "UD Las Palmas vs Real Madrid",
    description: "La Liga match at the Estadio Gran Canaria.",
    date_start: tomorrow,
    date_end: null,
    time: "17:00",
    location: "Estadio Gran Canaria",
    category: "sports",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1622460132742-d218ff93958d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTB8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://ud-las-palmas-vs-real-madrid",
  },
  {
    title: "Canarian Folk Music Night",
    description:
      "Traditional Canarian folk music performed live at Teatro Pérez Galdós.",
    date_start: tomorrow,
    date_end: null,
    time: "21:30",
    location: "Teatro Pérez Galdós",
    category: "music",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1718781379981-bfc5640a6ac4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTB8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://canarian-folk-music-night",
  },
  {
    title: "Photography Workshop",
    description:
      "Hands-on photography workshop for all skill levels at Casa de Colón.",
    date_start: tomorrow,
    date_end: null,
    time: "10:00",
    location: "Casa de Colón",
    category: "workshop",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1664768160237-069ee0f85942?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0NTF8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://photography-workshop",
  },
  // This week events
  {
    title: "Carnival Opening Ceremony",
    description:
      "The grand opening of the annual Las Palmas Carnival at Parque Santa Catalina.",
    date_start: saturday,
    date_end: null,
    time: null,
    location: "Parque Santa Catalina",
    category: "festival",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1723551908752-2b16d5b7ab34?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://carnival-opening-ceremony",
  },
  {
    title: "Flamenco Dance Show",
    description: "A passionate flamenco performance at Teatro Cuyás.",
    date_start: sunday,
    date_end: null,
    time: null,
    location: "Teatro Cuyás",
    category: "theater",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1755781988181-0e1d8c8e93c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://flamenco-dance-show",
  },
  {
    title: "Farmers Market & Crafts",
    description:
      "Fresh local produce and handmade crafts at Mercado del Puerto.",
    date_start: wednesday,
    date_end: null,
    time: null,
    location: "Mercado del Puerto",
    category: "market",
    ticket_price: null,
    image_url:
      "https://images.unsplash.com/photo-1637426992376-b8af65fb90d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w4NDM0ODN8MHwxfHJhbmRvbXx8fHx8fHx8fDE3Njk4NzE0OTd8&ixlib=rb-4.1.0&q=80&w=1080",
    source: "manual",
    source_url: "seed://farmers-market-crafts",
  },
];

async function seed() {
  console.log("Seeding events table...");
  console.log(`  Today: ${today}`);
  console.log(`  Tomorrow: ${tomorrow}`);
  console.log(`  Saturday: ${saturday}`);
  console.log(`  Sunday: ${sunday}`);
  console.log(`  Wednesday: ${wednesday}`);

  const { data, error } = await supabase
    .from("events")
    .insert(events)
    .select();

  if (error) {
    if (error.code === "23505") {
      console.log("Events already seeded (duplicate source_url). Skipping.");
      process.exit(0);
    }
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Successfully inserted ${data?.length ?? 0} events.`);
}

seed();
