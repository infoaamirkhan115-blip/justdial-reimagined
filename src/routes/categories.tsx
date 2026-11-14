import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { useDirectoryDefinitions } from "@/lib/managed-directory";
import { CategoryTile } from "@/components/site/ui";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "All categories — Justdial" },
      {
        name: "description",
        content:
          "Browse every local service and business category on Justdial, from restaurants to wholesalers.",
      },
      { property: "og:title", content: "All categories — Justdial" },
      {
        property: "og:description",
        content:
          "Browse every local service and business category on Justdial, from restaurants to wholesalers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { categories: CATEGORIES } = useDirectoryDefinitions();
  const [q, setQ] = useState("");
  const list = CATEGORIES.filter(
    (c) =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.subs.some((s) => s.toLowerCase().includes(q.toLowerCase())),
  );
  const groups = [...new Set(list.map((c) => c.group))];
  return (
    <div className="container-page pt-10">
      <h1 className="text-4xl font-extrabold md:text-5xl">All categories</h1>
      <p className="mt-2 text-muted-foreground">{CATEGORIES.length} categories</p>
      <label className="mt-6 flex h-12 max-w-md items-center gap-2 rounded-2xl border bg-card px-4">
        <Search className="size-5 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter categories"
          aria-label="Filter categories"
          className="flex-1 bg-transparent outline-none"
        />
      </label>
      {groups.map((g) => (
        <section key={g} className="mt-10">
          <h2 className="mb-4 text-xl font-bold">{g}</h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-8">
            {list
              .filter((c) => c.group === g)
              .map((c) => (
                <CategoryTile key={c.slug} {...c} />
              ))}
          </div>
        </section>
      ))}
      {list.length === 0 && (
        <p className="mt-10 text-muted-foreground">No category matches “{q}”.</p>
      )}
    </div>
  );
}
