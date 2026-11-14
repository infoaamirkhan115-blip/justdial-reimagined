import { createFileRoute } from "@tanstack/react-router";
import { DirectoryManager, managementQ } from "@/components/dash/directory-manager";
export const Route = createFileRoute("/_authenticated/admin/quality")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Listing quality centre — Justdial Admin" },
      { name: "description", content: "Manage listing quality centre in your Justdial directory." },
      { property: "og:title", content: "Listing quality centre — Justdial Admin" },
      { property: "og:description", content: "Maintain accurate directory records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managementQ),
  component: () => <DirectoryManager mode="quality" />,
});
