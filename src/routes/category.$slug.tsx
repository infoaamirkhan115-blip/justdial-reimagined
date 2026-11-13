import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { CATEGORIES, getCategory } from "@/data/catalog";
import { BusinessCard, CategoryTile, EnquiryForm } from "@/components/site/ui";
import { DynIcon } from "@/components/site/icon";
import { useCity } from "@/components/site/city";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessesQ } from "@/lib/public-data";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/category/$slug")({
  loader: ({ params }) => {
    const cat = getCategory(params.slug);
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.cat.name ?? "Category";
    return { meta: [
      { title: `Best ${n} near you — Justdial` },
      { name: "description", content: `Compare top-rated ${n.toLowerCase()} with verified reviews, prices and timings. Call or get quotes free.` },
      { property: "og:title", content: `Best ${n} near you — Justdial` },
      { property: "og:description", content: `Top-rated ${n.toLowerCase()} with verified reviews and prices.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ] };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { cat } = Route.useLoaderData();
  const { city } = useCity();
  const { data: live = [] } = useQuery(liveBusinessesQ);
  const list = live.filter((b) => b.category === cat.slug);
  const related = CATEGORIES.filter((c) => c.group === cat.group && c.slug !== cat.slug).slice(0, 6);
  return (
    <div className="container-page pt-6">
      <nav className="flex items-center gap-1 text-sm text-muted-foreground"><Link to="/" className="hover:underline">Home</Link><ChevronRight className="size-4" /><Link to="/categories" className="hover:underline">Categories</Link><ChevronRight className="size-4" /><span className="text-foreground">{cat.name}</span></nav>
      <header className="mt-4 flex flex-wrap items-center gap-5 rounded-[2rem] bg-saffron-soft p-6 md:p-10">
        <span className="grid size-16 place-items-center rounded-2xl bg-card shadow-soft"><DynIcon name={cat.icon} className="size-8" /></span>
        <div>
          <h1 className="text-3xl font-extrabold md:text-5xl">{cat.name} in {city}</h1>
          <p className="mt-1 text-muted-foreground">{(list.length * 1240 + 380).toLocaleString("en-IN")}+ listings · ratings from real customers</p>
        </div>
      </header>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {cat.subs.map((s) => <Link key={s} to="/search" search={{ q: s, city }} className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted">{s}</Link>)}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {list.length ? list.map((b) => <BusinessCard key={b.id} b={b} />) : (
            <div className="rounded-3xl border border-dashed bg-card p-10 text-center"><h2 className="text-xl font-bold">Listings coming soon</h2><p className="mt-1 text-sm text-muted-foreground">Share your requirement and we'll connect you with verified {cat.name.toLowerCase()}.</p></div>
          )}
          <section className="pt-8">
            <h2 className="mb-3 text-2xl font-bold">Frequently asked</h2>
            <Accordion type="single" collapsible className="rounded-3xl border bg-card px-5">
              {[
                [`How do I choose the best ${cat.name.toLowerCase()}?`, "Look for the Verified badge, a 4+ rating with many reviews, and years in business. Compare 2–3 options and ask for quotes."],
                ["Is it free to enquire?", "Yes. Calling, chatting and getting quotes is always free for customers."],
                ["What does Verified mean?", "We've checked the business's documents, address and phone number in person or via video."],
              ].map(([q, a]) => <AccordionItem key={q} value={q!}><AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
            </Accordion>
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <EnquiryForm title={`Need ${cat.name.toLowerCase()}?`} subtitle="Get callbacks from the top 5 near you." />
          {related.length > 0 && <div><h3 className="mb-3 font-bold">Related</h3><div className="grid grid-cols-3 gap-2">{related.map((c) => <CategoryTile key={c.slug} {...c} />)}</div></div>}
        </aside>
      </div>
    </div>
  );
}
