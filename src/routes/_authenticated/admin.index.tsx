import { createFileRoute } from "@tanstack/react-router";
import { OperationsOverview, operationsQ } from "@/components/dash/operations-overview";
export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({
    meta: [
      { title: "Operations overview — Justdial admin" },
      {
        name: "description",
        content:
          "Actionable requirements, support, listing and notification queues with accurate filtered totals.",
      },
      { property: "og:title", content: "Operations overview — Justdial admin" },
      {
        property: "og:description",
        content: "Manage operational queues and measurable directory outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(operationsQ()),
  component: () => <OperationsOverview />,
});
