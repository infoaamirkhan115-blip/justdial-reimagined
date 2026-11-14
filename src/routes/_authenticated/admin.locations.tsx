import { createFileRoute } from "@tanstack/react-router";
import { DirectoryManager, managementQ } from "@/components/dash/directory-manager";
export const Route = createFileRoute("/_authenticated/admin/locations")({
 head: () => ({ meta: [{ title: "Locations and branches — Justdial Admin" }, { name: "description", content: "Manage locations and branches in your Justdial directory." }, { property: "og:title", content: "Locations and branches — Justdial Admin" }, { property: "og:description", content: "Maintain accurate directory records." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
 loader: ({ context }) => context.queryClient.ensureQueryData(managementQ),
 component: () => <DirectoryManager mode="locations" />,
});
