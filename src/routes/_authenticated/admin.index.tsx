import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { TablesUpdate } from "@/integrations/supabase/types";
import { allBusinessesQ, allLeadsQ, allReviewsQ, allUsersQ } from "@/lib/admin-data";
import { getCategory } from "@/data/catalog";
import { PageTitle, Stat, timeAgo } from "@/components/dash/shell";
import { Btn } from "@/components/site/ui";

export const Route = createFileRoute("/_authenticated/admin/")({
  loader: ({ context: { queryClient: q } }) => Promise.all([q.ensureQueryData(allBusinessesQ), q.ensureQueryData(allLeadsQ), q.ensureQueryData(allReviewsQ), q.ensureQueryData(allUsersQ)]),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data: biz } = useSuspenseQuery(allBusinessesQ);
  const { data: leads } = useSuspenseQuery(allLeadsQ);
  const { data: reviews } = useSuspenseQuery(allReviewsQ);
  const { data: users } = useSuspenseQuery(allUsersQ);
  const pending = biz.filter((b) => b.status === "pending");
  const upgrades = biz.filter((b) => b.requested_plan);
  const week = Date.now() - 7 * 864e5;
  const set = async (id: string, patch: TablesUpdate<"businesses">, msg: string) => {
    const { error } = await supabase.from("businesses").update(patch).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(msg); qc.invalidateQueries({ queryKey: ["admin"] }); }
  };
  return (
    <>
      <PageTitle title="Admin overview" sub="Everything happening on the site at a glance." />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Live businesses" value={biz.filter((b) => b.status === "approved").length} hint={`${biz.length} total`} />
        <Stat label="Awaiting review" value={pending.length} tone="saffron" />
        <Stat label="Leads this week" value={leads.filter((l) => new Date(l.created_at).getTime() > week).length} hint={`${leads.length} all time`} tone="success" />
        <Stat label="Users" value={users.length} hint={`${reviews.length} reviews`} tone="coral" />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-3xl border bg-card p-5">
          <div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Approval queue</h2><Link to="/admin/businesses" search={{ status: "pending" }} className="text-sm font-bold hover:underline">Open queue</Link></div>
          {pending.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">All caught up 🎉</p> :
            <ul className="divide-y">{pending.slice(0, 6).map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{b.name}</p><p className="text-muted-foreground">{getCategory(b.category)?.name} · {b.city} · {timeAgo(b.created_at)}</p></div>
                <Btn variant="success" className="min-h-9 px-3" onClick={() => set(b.id, { status: "approved", admin_note: null }, "Approved")} aria-label="Approve"><Check className="size-4" /></Btn>
                <Btn variant="outline" className="min-h-9 px-3" onClick={() => { const n = prompt("Reason for rejection (shown to owner)"); if (n !== null) set(b.id, { status: "rejected", admin_note: n || null }, "Rejected"); }} aria-label="Reject"><X className="size-4" /></Btn>
              </li>))}</ul>}
        </section>
        <section className="rounded-3xl border bg-card p-5">
          <h2 className="mb-3 font-bold">Plan upgrade requests</h2>
          {upgrades.length === 0 ? <p className="py-6 text-center text-sm text-muted-foreground">No pending requests.</p> :
            <ul className="divide-y">{upgrades.map((b) => (
              <li key={b.id} className="flex items-center gap-3 py-3 text-sm">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold">{b.name}</p><p className="text-muted-foreground capitalize">{b.plan} → {b.requested_plan}</p></div>
                <Btn className="min-h-9 px-3" onClick={() => set(b.id, { plan: b.requested_plan, requested_plan: null, verified: true, sponsored: b.requested_plan === "platinum" }, "Plan activated")}>Activate</Btn>
                <Btn variant="ghost" className="min-h-9 px-3" onClick={() => set(b.id, { requested_plan: null }, "Request declined")}>Decline</Btn>
              </li>))}</ul>}
        </section>
      </div>
    </>
  );
}
