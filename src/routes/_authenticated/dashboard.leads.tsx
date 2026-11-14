import { createFileRoute } from "@tanstack/react-router";
import { LeadOperations } from "@/components/dash/lead-operations";
export const Route = createFileRoute("/_authenticated/dashboard/leads")({
  head: () => ({
    meta: [
      { title: "Customer enquiries — Justdial dashboard" },
      {
        name: "description",
        content: "Manage saved enquiries, recorded responses and reported outcomes.",
      },
      { property: "og:title", content: "Customer enquiries — Justdial dashboard" },
      {
        property: "og:description",
        content: "Accountable enquiry management and outcome records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <LeadOperations owner={true} />,
});
