import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, MapPinned, SearchX, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessesQ } from "@/lib/public-data";
import { CITIES, searchBusinesses } from "@/data/catalog";
import { BusinessCard, EnquiryForm } from "@/components/site/ui";
import { cn } from "@/lib/utils";

type S = { q?: string | undefined; city?: string | undefined };
export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
    city: typeof s["city"] === "string" && (CITIES as readonly string[]).includes(s["city"]) ? s["city"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Search results — Justdial" },
      { name: "description", content: "Compare ratings, reviews and prices from top local businesses, then call or enquire in one tap." },
      { property: "og:title", content: "Search local businesses — Justdial" },
      { property: "og:description", content: "Compare ratings, reviews and prices from top local businesses." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});

const SORTS = ["Relevance", "Rating", "Distance", "Popular"] as const;

function SearchPage() {
  const { q = "", city } = Route.useSearch();
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Relevance");
  const [f, setF] = useState({ top: false, open: false, verified: false, near: false });
  const { data: live = [] } = useQuery(liveBusinessesQ);
  const results = useMemo(() => {
    let r = searchBusinesses(q, city, live).filter((b) =>
      (!f.top || b.rating >= 4.5) && (!f.open || b.open) && (!f.verified || b.verified) && (!f.near || b.distance <= 3));
    if (sort === "Rating") r = [...r].sort((a, b) => b.rating - a.rating);
    if (sort === "Distance") r = [...r].sort((a, b) => a.distance - b.distance);
    if (sort === "Popular") r = [...r].sort((a, b) => b.reviews - a.reviews);
    return r;
  }, [q, city, sort, f, live]);
  const chip = (k: keyof typeof f, label: string) => (
    <button onClick={() => setF({ ...f, [k]: !f[k] })} aria-pressed={f[k]}
      className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition", f[k] ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:bg-muted")}>{label}</button>
  );
  return (
    <div className="container-page pt-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground"><Link to="/" className="hover:underline">Home</Link><ChevronRight className="size-4" />{city ?? "All cities"}<ChevronRight className="size-4" /><span className="text-foreground">{q || "All businesses"}</span></nav>
      <h1 className="mt-3 text-3xl font-extrabold md:text-4xl">{q ? `${q}` : "Popular businesses"}{city && <span className="text-muted-foreground"> in {city}</span>}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{results.length} results · Showing verified & top-rated first</p>

      <div className="sticky top-16 z-30 -mx-4 mt-6 border-b bg-background/90 px-4 py-3 backdrop-blur md:-mx-8 md:px-8">
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto">
          <span className="flex shrink-0 items-center gap-1 text-sm font-bold"><SlidersHorizontal className="size-4" />Filters</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} aria-label="Sort by" className="h-10 shrink-0 rounded-full border bg-card px-4 text-sm font-semibold">
            {SORTS.map((s) => <option key={s} value={s}>Sort: {s}</option>)}
          </select>
          {chip("top", "★ 4.5+")}{chip("open", "Open now")}{chip("verified", "Verified")}{chip("near", "Within 3 km")}
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {results.length === 0 ? (
            <div className="rounded-3xl border border-dashed bg-card p-12 text-center">
              <SearchX className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-3 text-xl font-bold">No matches yet</h2>
              <p className="mt-1 text-sm text-muted-foreground">Try removing a filter, or tell us what you need and we'll find it for you.</p>
            </div>
          ) : results.map((b) => <BusinessCard key={b.id} b={b} />)}
        </div>
        <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
          <div className="relative grid h-48 place-items-center overflow-hidden rounded-3xl border bg-success-soft">
            <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)] [background-size:24px_24px]" />
            <span className="relative flex items-center gap-2 rounded-full bg-card px-4 py-2 text-sm font-bold shadow-soft"><MapPinned className="size-4 text-coral" />View on map</span>
          </div>
          <EnquiryForm title="Get quotes from the top 5" subtitle={`Matching ${q || "businesses"} will call you back.`} cta="Get free quotes" />
        </aside>
      </div>
    </div>
  );
}
