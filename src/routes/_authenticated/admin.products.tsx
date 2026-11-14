import { createFileRoute } from "@tanstack/react-router";
import { OfferingsManager } from "@/components/dash/offerings-manager";
import { allBusinessesQ } from "@/lib/admin-data";
import { offeringsQ } from "@/lib/offerings";
export const Route = createFileRoute("/_authenticated/admin/products")({
  head: () => ({ meta: [{ title: "Manage products & services — Justdial Admin" }, { name: "description", content: "Manage every business product, service, photo, price and specification." }, { property: "og:title", content: "Products & services — Justdial Admin" }, { property: "og:description", content: "Business catalog management on Justdial." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(allBusinessesQ), context.queryClient.ensureQueryData(offeringsQ())]),
  component: () => <OfferingsManager />,
});