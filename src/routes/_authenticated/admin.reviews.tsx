import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { allReviewsQ } from "@/lib/admin-data";
import { Empty, PageTitle, Pill, timeAgo } from "@/components/dash/shell";
import { Btn, RatingBadge } from "@/components/site/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/reviews")({
  loader: ({ context }) => context.queryClient.ensureQueryData(allReviewsQ),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(allReviewsQ);
  const [f, setF] = useState("all");
  const list = data.filter((r) => f === "all" || (f === "low" ? r.rating <= 2 : r.status === f));
  const act = async (p: PromiseLike<{ error: { message: string } | null }>, msg: string) => { const { error } = await p; if (error) toast.error(error.message); else { toast.success(msg); qc.invalidateQueries(); } };
  return (
    <>
      <PageTitle title="Review moderation" sub="Hide fake, abusive or promotional reviews." />
      <div className="mb-4 flex gap-2">{[["all", "All"], ["published", "Published"], ["hidden", "Hidden"], ["low", "1–2 stars"]].map(([k, l]) => <button key={k} onClick={() => setF(k!)} className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", f === k ? "border-ink bg-ink text-ink-foreground" : "bg-card")}>{l}</button>)}</div>
      {list.length === 0 ? <Empty title="No reviews" /> : (
        <div className="space-y-3">{list.map((r) => (
          <div key={r.id} className={cn("rounded-3xl border bg-card p-5", r.status === "hidden" && "opacity-60")}>
            <div className="flex flex-wrap items-center gap-2"><RatingBadge rating={r.rating} /><span className="font-bold">{r.name}</span><span className="text-sm text-muted-foreground">on {r.businesses?.name} · {timeAgo(r.created_at)}</span><Pill v={r.status} />
              <div className="ml-auto flex gap-2">
                <Btn variant="outline" className="min-h-9" onClick={() => act(supabase.from("reviews").update({ status: r.status === "hidden" ? "published" : "hidden" }).eq("id", r.id), r.status === "hidden" ? "Published" : "Hidden")}>{r.status === "hidden" ? <><Eye className="size-4" />Publish</> : <><EyeOff className="size-4" />Hide</>}</Btn>
                <Btn variant="ghost" className="min-h-9" aria-label="Delete" onClick={() => confirm("Delete this review?") && act(supabase.from("reviews").delete().eq("id", r.id), "Deleted")}><Trash2 className="size-4 text-destructive" /></Btn>
              </div>
            </div>
            <p className="mt-2 text-[15px]">{r.text}</p>
            {r.owner_reply && <p className="mt-2 rounded-2xl bg-muted p-3 text-sm"><span className="font-bold">Owner reply: </span>{r.owner_reply}</p>}
          </div>))}</div>
      )}
    </>
  );
}
