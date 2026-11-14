import { createFileRoute } from "@tanstack/react-router";
import { TrustCenter, trustQ } from "@/components/dash/trust-center";
export const Route = createFileRoute("/_authenticated/admin/verification")({
  head: () => ({
    meta: [
      { title: "Information verification — Justdial" },
      {
        name: "description",
        content: "Manage information verification in your Justdial workspace.",
      },
      { property: "og:title", content: "Information verification — Justdial" },
      { property: "og:description", content: "Manage information verification securely." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trustQ),
  component: () => <TrustCenter mode="verification" />,
});
