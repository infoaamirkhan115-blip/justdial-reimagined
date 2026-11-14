import { createFileRoute } from "@tanstack/react-router";
import { TrustCenter, trustQ } from "@/components/dash/trust-center";

export const Route = createFileRoute("/_authenticated/admin/users")({
  head: () => ({
    meta: [
      { title: "User management \u2014 Justdial" },
      { name: "description", content: "Manage user management in your Justdial workspace." },
      { property: "og:title", content: "User management \u2014 Justdial" },
      { property: "og:description", content: "Manage user management in your Justdial workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(trustQ),
  component: () => <TrustCenter mode="staff" />,
});
