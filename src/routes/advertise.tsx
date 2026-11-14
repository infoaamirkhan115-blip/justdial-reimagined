import { createFileRoute } from "@tanstack/react-router";
import { Crown, LayoutPanelTop, ListOrdered } from "lucide-react";

import { EnquiryForm, SectionHeader } from "@/components/site/ui";

export const Route = createFileRoute("/advertise")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Advertise with Justdial — Reach customers ready to buy" }, { name: "description", content: "Sponsored listings, banners and category ownership that put your business in front of high-intent local searchers." },
    { property: "og:title", content: "Advertise with Justdial — Reach customers ready to buy" }, { property: "og:description", content: "Sponsored listings, banners and category ownership that put your business in front of high-intent local searchers." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page pt-6">
      <section className="grain relative overflow-hidden rounded-[2rem] bg-gradient-ink p-8 text-ink-foreground md:p-16">
        <h1 className="max-w-3xl text-4xl font-extrabold md:text-6xl">Advertise where people are <span className="text-primary">ready to buy.</span></h1>
        <p className="mt-4 max-w-xl text-ink-muted">Every search is a customer with a need. Request a relevant, clearly labelled placement.</p>
        <p className="mt-8 text-sm text-ink-muted">Placements require listing approval, matching targeting and approved commercial terms. Online payments are not configured.</p>
      </section>
      <section className="mt-16">
        <SectionHeader eyebrow="Formats" title="Pick how you want to be seen" />
        <div className="grid gap-4 md:grid-cols-3">{[[ListOrdered, "Sponsored listing", "Appear at the top of search results in your area, marked Sponsored."], [LayoutPanelTop, "Banner ads", "Eye-catching banners on category and home pages, targeted by city."], [Crown, "Targeted placement", "Approved placements stay relevant to the selected city and category."]].map(([I, t, d]) => { const Ic = I as typeof Crown; return <div key={t as string} className="rounded-3xl border bg-card p-6 lift"><span className="grid size-12 place-items-center rounded-xl bg-saffron-soft"><Ic className="size-6" /></span><h3 className="mt-4 text-lg font-bold">{t as string}</h3><p className="text-sm text-muted-foreground">{d as string}</p></div>; })}</div>
      </section>
      <section className="mx-auto mt-16 max-w-lg"><EnquiryForm title="Talk to our ads team" subtitle="We'll call you with a plan for your budget." cta="Request a callback" /></section>
    </div>
  );
}
