import { createFileRoute } from "@tanstack/react-router";
import { Copy, Tag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/page-hero";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/offers")({
  head: () => ({ meta: [
    { title: "Offers & deals near you — Justdial" }, { name: "description", content: "Exclusive discounts on restaurants, salons, home services, travel and bill payments near you." },
    { property: "og:title", content: "Offers & deals near you — Justdial" }, { property: "og:description", content: "Exclusive discounts on restaurants, salons, home services, travel and bill payments near you." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const OFFERS = [
  { c: "Food", t: "Flat 25% off at Saffron Thali House", code: "THALI25", e: "Ends Sun" },
  { c: "Home services", t: "AC service at ₹399 (was ₹599)", code: "COOL399", e: "Ends 30 Nov" },
  { c: "Beauty", t: "Free hair spa with any facial", code: "GLOWSPA", e: "Ends 25 Nov" },
  { c: "Bills", t: "₹50 cashback on electricity bill", code: "POWER50", e: "Ends 30 Nov" },
  { c: "Travel", t: "Up to ₹1,500 off on flights", code: "FLYJD", e: "Ends 20 Nov" },
  { c: "Food", t: "Buy 1 Get 1 on biryani, weekdays", code: "BIRYANI2", e: "Ends 15 Dec" },
  { c: "Health", t: "Full body checkup at ₹999", code: "CARE999", e: "Ends 31 Dec" },
  { c: "Home services", t: "15% off packers & movers", code: "SHIFT15", e: "Ends 10 Dec" },
];

function Page() {
  const cats = ["All", ...new Set(OFFERS.map((o) => o.c))];
  const [c, setC] = useState("All");
  return (
    <div className="container-page pt-6">
      <PageHero tone="saffron" eyebrow="Offers" title="Deals worth stepping out for." sub="Hand-picked discounts from businesses near you, updated daily." />
      <div className="no-scrollbar mt-8 flex gap-2 overflow-x-auto">{cats.map((x) => <button key={x} onClick={() => setC(x)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", c === x ? "border-ink bg-ink text-ink-foreground" : "bg-card")}>{x}</button>)}</div>
      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">{OFFERS.filter((o) => c === "All" || o.c === c).map((o) => (
        <div key={o.code} className="flex flex-col rounded-3xl border bg-card p-5 lift">
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-coral-soft px-2.5 py-1 text-xs font-bold text-coral"><Tag className="size-3.5" />{o.c}</span>
          <h3 className="mt-3 flex-1 text-lg font-bold leading-snug">{o.t}</h3>
          <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-dashed border-primary px-3 py-2"><span className="font-mono font-bold">{o.code}</span><button onClick={() => { navigator.clipboard?.writeText(o.code); toast.success(`Copied ${o.code}`); }} aria-label="Copy code"><Copy className="size-4" /></button></div>
          <p className="mt-2 text-xs text-muted-foreground">{o.e}</p>
        </div>))}</div>
    </div>
  );
}
