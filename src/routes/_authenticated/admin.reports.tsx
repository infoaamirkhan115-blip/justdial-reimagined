import { createFileRoute } from "@tanstack/react-router";
import { TrustCenter, trustQ } from "@/components/dash/trust-center";
export const Route = createFileRoute("/_authenticated/admin/reports")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Review reports and appeals — Justdial" },
      {
        name: "description",
        content: "Manage review reports and appeals in your Justdial workspace.",
      },
      { property: "og:title", content: "Review reports and appeals — Justdial" },
      { property: "og:description", content: "Manage review reports and appeals securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trustQ),
  component: () => <TrustCenter mode="reports" />,
});
