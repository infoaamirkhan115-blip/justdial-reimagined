import { createFileRoute, Link } from "@tanstack/react-router";
import { STATS } from "@/data/catalog";
import { btnClass } from "@/components/site/ui";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Justdial — India's local search engine since 1996" }, { name: "description", content: "How Justdial connects crores of people with local businesses across 11,000+ Indian cities and towns." },
    { property: "og:title", content: "About Justdial — India's local search engine since 1996" }, { property: "og:description", content: "How Justdial connects crores of people with local businesses across 11,000+ Indian cities and towns." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page pt-10">
      <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Since 1996</p>
      <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight md:text-6xl">We help India find what it needs, around the corner.</h1>
      <div className="mt-10 grid gap-10 md:grid-cols-2">
        <p className="text-lg leading-relaxed text-muted-foreground">Justdial started as a phone number you could call to find any local business. Today it's India's largest local search engine — on web, app, voice and WhatsApp — connecting people with plumbers and paediatricians, caterers and chartered accountants, in every corner of the country.</p>
        <p className="text-lg leading-relaxed text-muted-foreground">For small businesses, we're often the first place customers discover them. Free listings, verified badges and lead tools help shops and service providers grow without a big marketing budget.</p>
      </div>
      <div className="mt-16 grid grid-cols-2 gap-6 md:grid-cols-4">{STATS.map((s) => <div key={s.label} className="rounded-3xl bg-saffron-soft p-6"><p className="font-display text-3xl font-extrabold md:text-4xl">{s.value}</p><p className="mt-1 text-sm text-muted-foreground">{s.label}</p></div>)}</div>
      <div className="mt-16 flex flex-wrap gap-3"><Link to="/categories" className={btnClass("ink")}>Start exploring</Link><Link to="/free-listing" className={btnClass("outline")}>List your business</Link></div>
    </div>
  );
}
