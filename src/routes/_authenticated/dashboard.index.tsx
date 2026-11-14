import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { OperationsOverview, operationsQ } from "@/components/dash/operations-overview";
import { btnClass } from "@/components/site/ui";
export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Business performance — Justdial" },
      {
        name: "description",
        content:
          "Owner-only views, contact intent, enquiries, response times and reported outcomes.",
      },
      { property: "og:title", content: "Business performance — Justdial" },
      {
        property: "og:description",
        content: "Accurate business metrics with clear definitions and owner-scoped records.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(operationsQ(true)),
  component: () => (
    <>
      <div className="mb-6 flex justify-end">
        <Link to="/dashboard/businesses" search={{ new: true }} className={btnClass()}>
          <Plus className="size-4" />
          Add listing
        </Link>
      </div>
      <OperationsOverview owner />
    </>
  ),
});
