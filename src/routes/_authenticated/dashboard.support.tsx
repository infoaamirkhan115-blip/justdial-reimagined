import { createFileRoute } from "@tanstack/react-router";
import { SupportCenter, supportQ } from "@/components/dash/support-center";
export const Route = createFileRoute("/_authenticated/dashboard/support")({
  validateSearch: (s: Record<string, unknown>) => ({
    ticket: typeof s["ticket"] === "string" ? s["ticket"] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Support tickets — Justdial dashboard" },
      {
        name: "description",
        content: "Manage support tickets in your Justdial dashboard workspace.",
      },
      { property: "og:title", content: "Support tickets — Justdial dashboard" },
      {
        property: "og:description",
        content: "Saved requests, accountable actions and real outcomes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <SupportCenter staff={false} initialTicket={Route.useSearch().ticket} />,
});
