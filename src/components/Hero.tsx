import { MapPin } from "lucide-react";

export function Hero() {
  return (
    <section className="w-full bg-[var(--card)] p-12">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[var(--primary)]" />
          <span className="font-secondary text-base font-medium text-[var(--muted-foreground)]">
            Las Palmas de Gran Canaria
          </span>
        </div>
        <h1 className="font-primary text-4xl font-bold text-[var(--foreground)]">
          Discover Local Events
        </h1>
        <p className="font-secondary text-base text-[var(--muted-foreground)]">
          Find concerts, exhibitions, workshops and more happening in your city
        </p>
      </div>
    </section>
  );
}
