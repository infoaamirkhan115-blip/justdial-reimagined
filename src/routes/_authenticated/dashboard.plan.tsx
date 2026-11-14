import { createFileRoute } from "@tanstack/react-router";
import { CommerceManager } from "@/components/dash/commerce-manager";
export const Route = createFileRoute("/_authenticated/dashboard/plan")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Business subscriptions \u2014 Justdial" },
      { name: "description", content: "Manage business subscriptions in your Justdial workspace." },
      { property: "og:title", content: "Business subscriptions \u2014 Justdial" },
      {
        property: "og:description",
        content: "Manage business subscriptions in your Justdial workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <CommerceManager owner />,
});
