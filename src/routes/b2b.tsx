import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, FileText, Handshake, MessagesSquare, Factory, Shirt, Package, Cpu, Hammer, Leaf, Pill, Armchair } from "lucide-react";
import { EnquiryForm, SectionHeader, RatingBadge } from "@/components/site/ui";
import { RequirementForm } from "@/components/dash/lead-operations";

export const Route = createFileRoute("/b2b")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "B2B Marketplace — Buy wholesale from listed suppliers | Justdial" }, { name: "description", content: "Post your buying requirement and get quotes from listed manufacturers, wholesalers and exporters across India." },
    { property: "og:title", content: "B2B Marketplace — Buy wholesale from listed suppliers | Justdial" }, { property: "og:description", content: "Post your buying requirement and get quotes from listed manufacturers, wholesalers and exporters across India." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const CATS = [
  { n: "Industrial machinery", i: Factory }, { n: "Apparel & garments", i: Shirt }, { n: "Packaging", i: Package }, { n: "Electronics", i: Cpu },
  { n: "Building & hardware", i: Hammer }, { n: "Agriculture", i: Leaf }, { n: "Pharma & healthcare", i: Pill }, { n: "Furniture", i: Armchair },
];
function Page() {
  return (
    <div className="container-page pt-6">
      <section className="grid items-center gap-8 rounded-[2rem] bg-gradient-ink p-8 text-ink-foreground md:grid-cols-[1.3fr_1fr] md:p-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">Justdial B2B</p>
          <h1 className="mt-3 text-4xl font-extrabold md:text-6xl">India's wholesale market, in one place.</h1>
          <p className="mt-4 max-w-lg text-ink-muted">Submit a buying requirement for staff review and assignment to relevant listed businesses.</p>
        </div>
        <div className="text-foreground"><RequirementForm /></div>
      </section>
      <section className="mt-16">
        <SectionHeader eyebrow="Browse" title="Top product categories" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{CATS.map((c) => <div key={c.n} className="flex items-center gap-3 rounded-2xl border bg-card p-5 lift"><span className="grid size-12 place-items-center rounded-xl bg-saffron-soft"><c.i className="size-6" /></span><span className="font-bold">{c.n}</span></div>)}</div>
      </section>
      <section className="mt-16">
        <SectionHeader eyebrow="Simple" title="How it works" />
        <div className="grid gap-4 md:grid-cols-3">{[[FileText, "Post a requirement", "Describe the product, quantity and location."], [MessagesSquare, "Receive quotes", "Assigned suppliers can record responses and quotations."], [Handshake, "Close the deal", "Compare, negotiate and buy directly."]].map(([I, t, d], i) => { const Ic = I as typeof FileText; return (
          <div key={i} className="rounded-3xl border bg-card p-6"><span className="font-display text-5xl font-extrabold text-primary">0{i + 1}</span><Ic className="mt-4 size-6" /><h3 className="mt-2 text-lg font-bold">{t as string}</h3><p className="text-sm text-muted-foreground">{d as string}</p></div>); })}</div>
      </section>
    </div>
  );
}
