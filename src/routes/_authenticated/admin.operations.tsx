import { createFileRoute } from "@tanstack/react-router";
import { LeadOperations, leadOpsQ } from "@/components/dash/lead-operations";
export const Route = createFileRoute("/_authenticated/admin/operations")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>) => ({
    requirement: typeof s["requirement"] === "string" ? s["requirement"] : undefined,
    lead: typeof s["lead"] === "string" ? s["lead"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Lead operations — Justdial admin" },
      { name: "description", content: "Manage lead operations in your Justdial admin workspace." },
      { property: "og:title", content: "Lead operations — Justdial admin" },
      {
        property: "og:description",
        content: "Saved requests, accountable actions and real outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});
function Page() {
  const search = Route.useSearch();
  return (
    <LeadOperations
      owner={false}
      initialRequirement={search.requirement}
      initialLead={search.lead}
    />
  );
}
