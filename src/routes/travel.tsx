import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeftRight, BedDouble, Bus, Plane, TrainFront } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CITIES } from "@/data/catalog";
import { PageHero } from "@/components/site/page-hero";
import { Btn, SectionHeader, MiniBusinessCard } from "@/components/site/ui";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessesQ } from "@/lib/public-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/travel")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Travel — Book flights, hotels, buses & trains | Justdial" }, { name: "description", content: "Browse listed hotels and travel businesses. Online booking is not configured." },
    { property: "og:title", content: "Travel — Book flights, hotels, buses & trains | Justdial" }, { property: "og:description", content: "Browse listed hotels and travel businesses. Online booking is not configured." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const MODES = [{ k: "Flights", i: Plane }, { k: "Hotels", i: BedDouble }, { k: "Bus", i: Bus }, { k: "Trains", i: TrainFront }];
const DEALS = [["Mumbai → Goa", "from ₹2,149"], ["Delhi → Jaipur", "from ₹699 bus"], ["Bengaluru → Kochi", "from ₹2,899"], ["Chennai → Hyderabad", "from ₹1,999"]];

function Page() {
  const { data: hotels = [] } = useQuery(liveBusinessesQ);
  const [mode, setMode] = useState("Flights");
  const [from, setFrom] = useState("Mumbai");
  const [to, setTo] = useState("Delhi");
  const field = "h-12 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground";
  return (
    <div className="container-page pt-6">
      <PageHero eyebrow="Travel" title="Hotels and travel businesses" sub="Contact listed businesses directly. Online booking is not configured.">
        <div className="rounded-3xl bg-card p-4 text-foreground shadow-lift md:p-6">
          <div className="no-scrollbar flex gap-2 overflow-x-auto">{MODES.map((m) => <button key={m.k} onClick={() => setMode(m.k)} className={cn("flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold", mode === m.k ? "bg-ink text-ink-foreground" : "bg-muted")}><m.i className="size-4" />{m.k}</button>)}</div>
          <form onSubmit={(e) => { e.preventDefault(); toast.info("Online travel booking is not configured. Contact a listed travel business."); }} className="mt-4 grid items-end gap-3 md:grid-cols-[1fr_auto_1fr_1fr_auto]">
            {mode !== "Hotels" && <label className="text-xs font-bold">From<select value={from} onChange={(e) => setFrom(e.target.value)} className={field}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>}
            {mode !== "Hotels" && <button type="button" aria-label="Swap" onClick={() => { setFrom(to); setTo(from); }} className="mb-1 grid size-10 place-items-center rounded-full border"><ArrowLeftRight className="size-4" /></button>}
            <label className={cn("text-xs font-bold", mode === "Hotels" && "md:col-span-3")}>{mode === "Hotels" ? "City" : "To"}<select value={to} onChange={(e) => setTo(e.target.value)} className={field}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="text-xs font-bold">Date<input type="date" className={field} /></label>
            <Btn type="submit" className="h-12">Search</Btn>
          </form>
        </div>
      </PageHero>
      <section className="mt-12"><SectionHeader eyebrow="Stay" title="Top hotels" action={<Link to="/category/$slug" params={{ slug: "hotels" }} className="text-sm font-bold hover:underline">View all</Link>} />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">{hotels.filter((b) => b.category === "hotels").map((b) => <MiniBusinessCard key={b.id} b={b} />)}</div>
      </section>
    </div>
  );
}
