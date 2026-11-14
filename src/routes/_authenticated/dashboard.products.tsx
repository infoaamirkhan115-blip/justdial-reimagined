import { createFileRoute } from "@tanstack/react-router";
import { OfferingsManager } from "@/components/dash/offerings-manager";
import { myBusinessesQ } from "@/lib/owner-data";
import { offeringsQ } from "@/lib/offerings";
export const Route = createFileRoute("/_authenticated/dashboard/products")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "My products & services — Justdial" }, { name: "description", content: "Manage products, services, photos and pricing for your Justdial business listings." }, { property: "og:title", content: "My products & services — Justdial" }, { property: "og:description", content: "Your business catalog on Justdial." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context }) => Promise.all([context.queryClient.ensureQueryData(myBusinessesQ(context.user.id)), context.queryClient.ensureQueryData(offeringsQ(undefined, context.user.id))]),
  component: Page,
});
function Page() { const { user } = Route.useRouteContext(); return <OfferingsManager ownerId={user.id} />; }