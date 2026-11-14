import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { myBusinessesQ } from "@/lib/owner-data";
import { Empty, PageTitle, Pill } from "@/components/dash/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard/plan")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myBusinessesQ(context.user.id)),
  component: Page,
});

const PLANS = [
  { k: "free", name: "Free", price: "₹0", f: ["Listing & photos", "Customer reviews", "Leads by SMS"] },
  { k: "premium", name: "Premium", price: "₹999/mo", f: ["Everything in Free", "Higher search ranking", "Verified badge"] },
  { k: "platinum", name: "Platinum", price: "₹2,999/mo", f: ["Everything in Premium", "Sponsored top placement", "Account manager"] },
] as const;

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(myBusinessesQ(user.id));
  const request = async (id: string, plan: string | null) => {
    const { error } = await supabase.from("businesses").update({ requested_plan: plan }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success(plan ? "Upgrade requested. Our team will call you to activate it." : "Request cancelled"); qc.invalidateQueries(); }
  };
  return (
    <>
      <PageTitle title="Plans" sub="Upgrade a listing to rank higher and get more leads." />
      {data.length === 0 ? <Empty title="Add a listing first" /> : data.map((b) => (
        <section key={b.id} className="mb-8">
          <div className="mb-3 flex items-center gap-2"><h2 className="text-lg font-bold">{b.name}</h2><Pill v={b.plan} />{b.requested_plan && <span className="text-sm text-muted-foreground">· {b.requested_plan} requested <button onClick={() => request(b.id, null)} className="font-bold text-coral hover:underline">Cancel</button></span>}</div>
          <div className="grid gap-3 md:grid-cols-3">{PLANS.map((p) => {
            const current = b.plan === p.k; const asked = b.requested_plan === p.k;
            return (
              <div key={p.k} className={cn("flex flex-col rounded-3xl border bg-card p-5", current && "border-2 border-primary")}>
                <p className="font-bold">{p.name}</p><p className="font-display text-2xl font-extrabold">{p.price}</p>
                <ul className="my-4 flex-1 space-y-1.5 text-sm">{p.f.map((x) => <li key={x} className="flex gap-2"><Check className="size-4 text-success" />{x}</li>)}</ul>
                {current ? <span className="rounded-xl bg-muted py-2.5 text-center text-sm font-bold">Current plan</span>
                  : p.k === "free" ? <span className="py-2.5 text-center text-sm text-muted-foreground">—</span>
                  : <button disabled={asked} onClick={() => request(b.id, p.k)} className="min-h-11 rounded-xl bg-primary text-sm font-bold text-primary-foreground disabled:opacity-50">{asked ? "Requested" : `Request ${p.name}`}</button>}
              </div>);
          })}</div>
        </section>
      ))}
    </>
  );
}
