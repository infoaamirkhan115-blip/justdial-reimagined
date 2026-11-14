import { createFileRoute } from "@tanstack/react-router";
import { Clock, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeader } from "@/components/site/ui";
import { useCity } from "@/components/site/city";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/movies")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Movies near you — Showtimes & tickets | Justdial" }, { name: "description", content: "Find movie showtimes at cinemas near you and book tickets in a few taps." },
    { property: "og:title", content: "Movies near you — Showtimes & tickets | Justdial" }, { property: "og:description", content: "Find movie showtimes at cinemas near you and book tickets in a few taps." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const MOVIES = [
  { t: "Monsoon Express", g: "Drama · Hindi", r: 8.6, d: "2h 21m", hue: "bg-coral" },
  { t: "Kaval", g: "Thriller · Tamil", r: 8.9, d: "2h 34m", hue: "bg-ink" },
  { t: "Rangeen Galli", g: "Comedy · Hindi", r: 7.8, d: "2h 05m", hue: "bg-primary" },
  { t: "Sea of Stars", g: "Sci-fi · English", r: 8.2, d: "2h 40m", hue: "bg-success" },
];
const CINEMAS = ["PVR Phoenix Mall", "INOX Nariman Point", "Cinepolis Andheri"];
const TIMES = ["10:15 AM", "1:30 PM", "4:45 PM", "7:20 PM", "10:40 PM"];

function Page() {
  const { city } = useCity();
  const [m, setM] = useState(0);
  const mv = MOVIES[m]!;
  return (
    <div className="container-page pt-6">
      <PageHero eyebrow={`Now showing in ${city}`} title="Your next movie night, sorted." sub="Compare showtimes across cinemas and book in a tap." />
      <section className="mt-12"><SectionHeader title="Now showing" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">{MOVIES.map((x, i) => (
          <button key={x.t} onClick={() => setM(i)} className={cn("overflow-hidden rounded-3xl border bg-card text-left lift", i === m && "ring-2 ring-primary")}>
            <div className={cn("grain relative grid aspect-[3/4] place-items-end p-4 text-ink-foreground", x.hue)}><span className="font-display text-2xl font-extrabold leading-tight">{x.t}</span></div>
            <div className="p-4"><p className="text-sm text-muted-foreground">{x.g}</p><p className="mt-1 flex items-center gap-3 text-sm font-semibold"><span className="flex items-center gap-1"><Star className="size-4 fill-primary text-primary" />{x.r}</span><span className="flex items-center gap-1"><Clock className="size-4" />{x.d}</span></p></div>
          </button>))}</div>
      </section>
      <section className="mt-12"><SectionHeader eyebrow="Showtimes" title={mv.t} />
        <div className="space-y-3">{CINEMAS.map((c) => (
          <div key={c} className="flex flex-col gap-3 rounded-3xl border bg-card p-5 md:flex-row md:items-center">
            <p className="font-bold md:w-60">{c}</p>
            <div className="flex flex-wrap gap-2">{TIMES.map((t) => <button key={t} onClick={() => toast.success(`${mv.t} · ${c} · ${t} — seats held for 10 mins (demo)`)} className="rounded-xl border border-success px-4 py-2 text-sm font-semibold text-success hover:bg-success-soft">{t}</button>)}</div>
          </div>))}</div>
      </section>
    </div>
  );
}
