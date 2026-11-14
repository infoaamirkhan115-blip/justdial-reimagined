import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { myReviewsQ } from "@/lib/owner-data";
import { Empty, PageTitle, Pill, timeAgo } from "@/components/dash/shell";
import { Btn, RatingBadge } from "@/components/site/ui";

export const Route = createFileRoute("/_authenticated/dashboard/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(myReviewsQ(context.user.id)),
  component: Page,
});

function Reply({ id, initial }: { id: string; initial: string | null }) {
  const qc = useQueryClient();
  const [t, setT] = useState(initial ?? "");
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="mt-3 text-sm font-bold text-coral hover:underline">{initial ? "Edit reply" : "Reply publicly"}</button>;
  return (
    <form className="mt-3 space-y-2" onSubmit={async (e) => { e.preventDefault(); const { error } = await supabase.from("reviews").update({ owner_reply: t.trim() || null }).eq("id", id); if (error) toast.error(error.message); else { toast.success("Reply saved"); setOpen(false); qc.invalidateQueries(); } }}>
      <textarea value={t} onChange={(e) => setT(e.target.value)} maxLength={1000} rows={3} placeholder="Thank the customer or address their concern…" className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
      <div className="flex gap-2"><Btn type="submit">Save reply</Btn><Btn type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Btn></div>
    </form>
  );
}

function Page() {
  const { user } = Route.useRouteContext();
  const { data } = useSuspenseQuery(myReviewsQ(user.id));
  return (
    <>
      <PageTitle title="Reviews" sub="Replying to reviews builds trust with new customers." />
      {data.length === 0 ? <Empty title="No reviews yet" sub="Ask happy customers to review you on your listing page." /> : (
        <div className="space-y-3">{data.map((r) => (
          <div key={r.id} className="rounded-3xl border bg-card p-5">
            <div className="flex flex-wrap items-center gap-2"><RatingBadge rating={r.rating} /><span className="font-bold">{r.name}</span><span className="text-sm text-muted-foreground">on {r.businesses.name} · {timeAgo(r.created_at)}</span>{r.status !== "published" && <Pill v={r.status} />}</div>
            <p className="mt-2 text-[15px] leading-relaxed">{r.text}</p>
            {r.owner_reply && <div className="mt-3 rounded-2xl bg-muted p-3 text-sm"><span className="font-bold">Your reply: </span>{r.owner_reply}</div>}
            <Reply id={r.id} initial={r.owner_reply} />
          </div>))}</div>
      )}
    </>
  );
}
