import { createFileRoute } from "@tanstack/react-router";
import { LeadOperations } from "@/components/dash/lead-operations";
export const Route = createFileRoute("/_authenticated/admin/leads")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Customer enquiries — Justdial admin" },
      {
        name: "description",
        content: "Manage saved enquiries, recorded responses and reported outcomes.",
      },
      { property: "og:title", content: "Customer enquiries — Justdial admin" },
      {
        property: "og:description",
        content: "Accountable enquiry management and outcome records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <LeadOperations owner={false} />,
});
