import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building2, Crown, Inbox, LayoutDashboard, Package, Star, LifeBuoy, Bell } from "lucide-react";
import { DashShell } from "@/components/dash/shell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Business workspace \u2014 Justdial" },
      { name: "description", content: "Manage your Justdial business workspace." },
      { property: "og:title", content: "Business workspace \u2014 Justdial" },
      { property: "og:description", content: "Manage your Justdial business workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <DashShell
      label="Business"
      nav={[
        { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
        { to: "/dashboard/operations", label: "Enquiries & outcomes", icon: Inbox },
        { to: "/dashboard/support", label: "Support tickets", icon: LifeBuoy },
        { to: "/dashboard/notifications", label: "Notifications", icon: Bell },
        { to: "/dashboard/businesses", label: "My listings", icon: Building2 },
        { to: "/dashboard/products", label: "Products & services", icon: Package },
        { to: "/dashboard/leads", label: "Leads", icon: Inbox },
        { to: "/dashboard/reviews", label: "Reviews", icon: Star },
        { to: "/dashboard/claims", label: "Ownership claims", icon: Building2 },
        { to: "/dashboard/reports", label: "Reports & appeals", icon: Star },
        { to: "/dashboard/plan", label: "Plans", icon: Crown },
      ]}
    >
      <Outlet />
    </DashShell>
  ),
});
