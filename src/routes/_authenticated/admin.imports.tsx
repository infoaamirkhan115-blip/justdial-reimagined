import { createFileRoute } from "@tanstack/react-router";
import { DirectoryManager, managementQ } from "@/components/dash/directory-manager";
export const Route = createFileRoute("/_authenticated/admin/imports")({
  head: () => ({
    meta: [
      { title: "Imports and duplicate review — Justdial Admin" },
      {
        name: "description",
        content: "Manage imports and duplicate review in your Justdial directory.",
      },
      { property: "og:title", content: "Imports and duplicate review — Justdial Admin" },
      { property: "og:description", content: "Maintain accurate directory records." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(managementQ),
  component: () => <DirectoryManager mode="imports" />,
});
