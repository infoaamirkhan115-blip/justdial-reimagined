import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Phone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { myLeadsQ } from "@/lib/owner-data";
import { Empty, PageTitle, Pill, timeAgo } from "@/components/dash/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/leads")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myLeadsQ(context.user.id)),
  component: Page,
});
const LEAD_STATUSES = ["new", "contacted", "won", "lost"] as const;

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(myLeadsQ(user.id));
  const [f, setF] = useState<string>("all");
  const list = data.filter((l) => f === "all" || l.status === f);
  const update = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(`Marked ${status}`); qc.invalidateQueries({ queryKey: ["my-leads"] }); }
  };
  return (
    <>
      <PageTitle title="Leads" sub="Customers who asked for a callback or the best price. Call them quickly to win the deal." />
      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">{["all", ...LEAD_STATUSES].map((s) => <button key={s} onClick={() => setF(s)} className={cn("shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize", f === s ? "border-ink bg-ink text-ink-foreground" : "bg-card")}>{s} {s === "all" ? data.length : data.filter((l) => l.status === s).length}</button>)}</div>
      {list.length === 0 ? <Empty title="No leads here" sub="When customers enquire from your listing, they show up here." /> : (
        <div className="overflow-hidden rounded-3xl border bg-card">
          <ul className="divide-y">{list.map((l) => (
            <li key={l.id} className="flex flex-col gap-3 p-5 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{l.name} <Pill v={l.status} /></p>
                <p className="text-sm text-muted-foreground">For {l.businesses.name} · {timeAgo(l.created_at)}</p>
                {l.message && <p className="mt-1 text-sm">“{l.message}”</p>}
              </div>
              <a href={`tel:+91${l.phone}`} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-ink-foreground"><Phone className="size-4" />+91 {l.phone}</a>
              <select value={l.status} onChange={(e) => update(l.id, e.target.value)} aria-label="Lead status" className="h-10 rounded-xl border bg-background px-3 text-sm font-semibold capitalize">{LEAD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            </li>))}</ul>
        </div>
      )}
    </>
  );
}
