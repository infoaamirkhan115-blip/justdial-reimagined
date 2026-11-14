import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessesQ } from "@/lib/public-data";
import { directoryResults } from "@/lib/directory-search";
import { BusinessCard, Btn, DirectoryState } from "@/components/site/ui";
import { SearchBar } from "@/components/site/search-bar";
import { useEffect } from "react";
import { trackDirectory } from "@/lib/directory-analytics";
import { useWebMCP } from "use-webmcp-tool";
import { runWebMCPTool } from "@/lib/webmcp-telemetry";

type S = {
  q?: string | undefined;
  city?: string | undefined;
  locality?: string | undefined;
  sort?: string | undefined;
  page?: number | undefined;
  verified?: boolean | undefined;
  rated?: boolean | undefined;
};
export const Route = createFileRoute("/search")({
  validateSearch: (s: Record<string, unknown>): S => ({
    q: typeof s["q"] === "string" ? s["q"] : undefined,
    city: typeof s["city"] === "string" ? s["city"] : undefined,
    locality: typeof s["locality"] === "string" ? s["locality"] : undefined,
    sort: ["Relevance", "Rating", "Popular"].includes(String(s["sort"]))
      ? String(s["sort"])
      : undefined,
    page: Number.isInteger(Number(s["page"])) && Number(s["page"]) > 0 ? Number(s["page"]) : 1,
    verified: s["verified"] === true || s["verified"] === "true" || undefined,
    rated: s["rated"] === true || s["rated"] === "true" || undefined,
  }),
  head: () => ({
    meta: [
      { title: "Local business and service search — Justdial" },
      {
        name: "description",
        content:
          "Find approved local businesses and published products and services, with honest ratings and contact details.",
      },
      { property: "og:title", content: "Local business and service search — Justdial" },
      {
        property: "og:description",
        content: "Search businesses, products and services in your selected city.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SearchPage,
});
function SearchPage() {
  const s = Route.useSearch();
  const city = s["city"] ?? "Noida";
  const nav = Route.useNavigate();
  const query = useQuery(liveBusinessesQ);
  const result = directoryResults(query.data ?? [], { ...s, city });
  useEffect(() => {
    if (!query.isSuccess || query.isFetching) return;
    trackDirectory("search", { city, term: s.q ?? "" });
    if (result.total === 0) trackDirectory("zero_result_search", { city, term: s.q ?? "" });
  }, [query.isSuccess, query.isFetching, city, s.q, s.locality, s.rated, s.verified, result.total]);
  const update = (change: Partial<S>) =>
    nav({ search: { ...s, ...change, page: change.page ?? 1 } });
  const localities = [
    ...new Set(
      (query.data ?? [])
        .filter((b) => b.city === city)
        .map((b) => b.area)
        .filter(Boolean),
    ),
  ].sort();
  useWebMCP({
    name: "read_search_results",
    description:
      "Read the businesses currently visible on this search results page, respecting city, filters and pagination.",
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    execute: () =>
      runWebMCPTool("read_search_results", () => {
        if (query.isPending || query.isFetching) return "Search results are loading.";
        if (query.isError) throw new Error("Search results are unavailable. Retry using the page.");
        return (
          `Page ${result.page} of ${result.pages}; ${result.total} matches in ${city}.\n` +
          (result.results.map((b) => `${b.id}: ${b.name} — ${b.area}, ${b.city}`).join("\n") ||
            "No businesses shown.")
        );
      }),
  });
  async function openVisibleBusiness(id: unknown) {
    if (typeof id !== "string") throw new Error("business_id must be a string.");
    if (query.isPending || query.isFetching || query.isError)
      throw new Error("Wait for available search results before opening a business.");
    const business = result.results.find((b) => b.id === id);
    if (!business) throw new Error("This business is not on the current results page.");
    await nav({ to: "/business/$id", params: { id: business.id } });
    return "Business details opened.";
  }
  useWebMCP<{ business_id: string }, string>({
    name: "open_search_result",
    description:
      "Open details for a business currently visible on this results page, using an ID from read_search_results.",
    enabled: query.isSuccess && !query.isFetching,
    inputSchema: {
      type: "object",
      properties: {
        business_id: { type: "string", description: "ID of a business currently shown." },
      },
      required: ["business_id"],
      additionalProperties: false,
    },
    execute: ({ business_id }) =>
      runWebMCPTool("open_search_result", () => openVisibleBusiness(business_id)),
  });
  return (
    <div className="container-page pt-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/">Home</Link>
        <ChevronRight className="size-4" />
        {city}
        <ChevronRight className="size-4" />
        {s["q"] || "All businesses"}
      </nav>
      <h1 className="mt-3 break-words text-3xl font-extrabold md:text-4xl">
        {s["q"] || "Businesses"} in {city}
      </h1>
      <div className="mt-5 max-w-3xl">
        <SearchBar initial={s["q"] ?? ""} initialCity={city} />
      </div>
      <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
        {query.isPending
          ? "Loading businesses…"
          : query.isError
            ? "Results unavailable"
            : `${result.total} results${query.isFetching ? " · Updating…" : ""}`}
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-2 border-y py-3">
        <span className="flex items-center gap-1 text-sm font-bold">
          <SlidersHorizontal className="size-4" />
          Filters
        </span>
        <select
          aria-label="Sort by"
          value={s["sort"] ?? "Relevance"}
          onChange={(e) => update({ sort: e.target.value })}
          className="h-11 max-w-full rounded-xl border bg-card px-3 text-sm"
        >
          {["Relevance", "Rating", "Popular"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <select
          aria-label="Locality"
          value={s["locality"] ?? ""}
          onChange={(e) => update({ locality: e.target.value || undefined })}
          className="h-11 max-w-full rounded-xl border bg-card px-3 text-sm"
        >
          <option value="">All localities</option>
          {localities.map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
        <Btn
          variant={s["rated"] ? "ink" : "outline"}
          aria-pressed={Boolean(s["rated"])}
          onClick={() => update({ rated: !s["rated"] })}
        >
          ★ 4.5+
        </Btn>
        <Btn
          variant={s["verified"] ? "ink" : "outline"}
          aria-pressed={Boolean(s["verified"])}
          onClick={() => update({ verified: !s["verified"] })}
        >
          Verified
        </Btn>
        <span title="Structured hours and timezone are not available">
          <Btn variant="outline" disabled>
            Open now
          </Btn>
        </span>
        <span title="Business coordinates and a search origin are not available">
          <Btn variant="outline" disabled>
            Within 3 km
          </Btn>
        </span>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Open-now and distance filters are unavailable until verified hours and coordinates are
        provided. Popular sorts by review count; unrated businesses appear last.
      </p>
      <div className="mt-6 max-w-4xl space-y-4">
        <DirectoryState query={query} empty={result.total === 0} />
        {!query.isPending &&
          !query.isError &&
          result.results.map((b) => <BusinessCard key={b.id} b={b} />)}
        {!query.isPending && !query.isError && result.total > 0 && (
          <nav
            aria-label="Results pages"
            className="flex flex-wrap items-center justify-between gap-3 py-6"
          >
            <Btn
              variant="outline"
              disabled={result.page === 1}
              onClick={() => update({ page: result.page - 1 })}
            >
              Previous
            </Btn>
            <span className="text-sm">
              Page {result.page} of {result.pages}
            </span>
            <Btn
              variant="outline"
              disabled={result.page === result.pages}
              onClick={() => update({ page: result.page + 1 })}
            >
              Next
            </Btn>
          </nav>
        )}
      </div>
    </div>
  );
}
