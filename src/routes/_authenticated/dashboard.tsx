import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Building2, Crown, Inbox, LayoutDashboard, Star } from "lucide-react";
import { DashShell } from "@/components/dash/shell";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Business dashboard — Justdial" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <DashShell label="Business" nav={[
      { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
      { to: "/dashboard/businesses", label: "My listings", icon: Building2 },
      { to: "/dashboard/leads", label: "Leads", icon: Inbox },
      { to: "/dashboard/reviews", label: "Reviews", icon: Star },
      { to: "/dashboard/plan", label: "Plans", icon: Crown },
    ]}><Outlet /></DashShell>
  ),
});
