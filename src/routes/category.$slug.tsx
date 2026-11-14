import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  directoryDefinitionsQ,
  mapCategories,
  useDirectoryDefinitions,
} from "@/lib/managed-directory";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { BusinessCard, CategoryTile, DirectoryState } from "@/components/site/ui";
import { DynIcon } from "@/components/site/icon";
import { useCity } from "@/components/site/city";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessesQ } from "@/lib/public-data";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { EnquiryPopup } from "@/components/site/enquiry-popup";
import { SponsoredResults } from "@/components/site/sponsored-results";

export const Route = createFileRoute("/category/$slug")({
  staticData: { sitemap: true },
  loader: async ({ params, context }) => {
    const definitions = await context.queryClient.ensureQueryData(directoryDefinitionsQ);
    const cat = mapCategories(definitions.categories).find(
      (c) => c.slug === params.slug || c.canonicalSlug === params.slug,
    );
    if (cat && cat.canonicalSlug !== params.slug)
      throw redirect({
        to: "/category/$slug",
        params: { slug: cat.canonicalSlug },
        statusCode: 301,
      });
    if (!cat) {
      const r = await supabase
        .from("directory_redirects")
        .select("to_key")
        .eq("kind", "category")
        .eq("from_key", params.slug)
        .maybeSingle();
      if (r.error) throw r.error;
      if (r.data)
        throw redirect({ to: "/category/$slug", params: { slug: r.data.to_key }, statusCode: 301 });
    }
    if (!cat) throw notFound();
    return { cat };
  },
  head: ({ loaderData }) => {
    const n = loaderData?.cat.name ?? "Category";
    return {
      meta: [
        { title: `${n} directory — Justdial` },
        {
          name: "description",
          content: `Browse ${n.toLowerCase()} by city, compare available business details and send an enquiry.`,
        },
        { property: "og:title", content: `${n} directory — Justdial` },
        {
          property: "og:description",
          content: `Find ${n.toLowerCase()} in your selected city and contact a business directly.`,
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: CategoryPage,
});

function CategoryPage() {
  const { categories: CATEGORIES } = useDirectoryDefinitions();
  const [filters, setFilters] = useState<Record<string, string>>({});
  const { cat } = Route.useLoaderData();
  const { city } = useCity();
  const query = useQuery(liveBusinessesQ);
  const live = query.data ?? [];
  const list = live.filter(
    (b) =>
      b.category === cat.slug &&
      b.city === city &&
      Object.entries(filters).every(
        ([k, v]) =>
          !v ||
          String(b.attributes?.[k] ?? "")
            .toLowerCase()
            .includes(v.toLowerCase()),
      ),
  );
  const related = CATEGORIES.filter((c) => c.group === cat.group && c.slug !== cat.slug).slice(
    0,
    6,
  );
  return (
    <div className="container-page pt-6">
      <SponsoredResults city={city} category={cat.slug} placement="category" allowedIds={list.map(b=>b.id)} />
      <nav className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link to="/categories" className="hover:underline">
          Categories
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{cat.name}</span>
      </nav>
      <header className="mt-4 flex flex-wrap items-center gap-5 rounded-[2rem] bg-saffron-soft p-6 md:p-10">
        <span className="grid size-16 place-items-center rounded-2xl bg-card shadow-soft">
          <DynIcon name={cat.icon} className="size-8" />
        </span>
        <div>
          <h1 className="text-3xl font-extrabold md:text-5xl">
            {cat.name} in {city}
          </h1>
          <p className="mt-1 text-muted-foreground">
            {query.isPending
              ? "Loading listings…"
              : query.isError
                ? "Listings unavailable"
                : `${list.length} listings`}
          </p>
        </div>
      </header>
      <div className="mt-5 flex flex-wrap gap-3">
        {cat.fields
          .filter((f) => f.filter)
          .map((f) => (
            <label key={f.key} className="text-sm font-bold">
              {f.label}
              <select
                aria-label={`Filter ${f.label}`}
                className="ml-2 h-10 rounded-xl border bg-card px-3"
                value={filters[f.key] ?? ""}
                onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}
              >
                <option value="">All</option>
                {[
                  ...new Set(
                    live
                      .filter((b) => b.category === cat.slug && b.city === city)
                      .map((b) => String(b.attributes?.[f.key] ?? ""))
                      .filter(Boolean),
                  ),
                ].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          ))}
      </div>
      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto">
        {cat.subs.map((s) => (
          <Link
            key={s}
            to="/search"
            search={{ q: s, city }}
            className="shrink-0 rounded-full border bg-card px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            {s}
          </Link>
        ))}
      </div>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          <DirectoryState query={query} empty={!list.length} />
          {!query.isPending && !query.isError && list.map((b) => <BusinessCard key={b.id} b={b} />)}
          <section className="pt-8">
            <h2 className="mb-3 text-2xl font-bold">Frequently asked</h2>
            <Accordion type="single" collapsible className="rounded-3xl border bg-card px-5">
              {[
                [
                  `How do I choose the best ${cat.name.toLowerCase()}?`,
                  "Look for the Verified badge, a 4+ rating with many reviews, and years in business. Compare 2–3 options and ask for quotes.",
                ],
                [
                  "Is it free to enquire?",
                  "Yes. Calling, chatting and getting quotes is always free for customers.",
                ],
                [
                  "What does Verified mean?",
                  "Verification is separate from subscriptions and sponsored placement. Ask for documents relevant to your requirement.",
                ],
              ].map(([q, a]) => (
                <AccordionItem key={q} value={q ?? ""}>
                  <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {list[0] && (
            <EnquiryPopup
              label={`Enquire about ${cat.name.toLowerCase()}`}
              context={{
                businessId: list[0].id,
                businessName: list[0].name,
                title: cat.name,
                image: list[0].image,
                location: `${list[0].area}, ${list[0].city}`,
                description: list[0].description,
              }}
            />
          )}
          {related.length > 0 && (
            <div>
              <h3 className="mb-3 font-bold">Related</h3>
              <div className="grid grid-cols-3 gap-2">
                {related.map((c) => (
                  <CategoryTile key={c.slug} {...c} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
