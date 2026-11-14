import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { allLeadsQ } from "@/lib/admin-data";
import { Empty, PageTitle, timeAgo } from "@/components/dash/shell";

export const Route = createFileRoute("/_authenticated/admin/leads")({
  head: () => ({
    meta: [
      { title: "Lead management \u2014 Justdial" },
      { name: "description", content: "Manage lead management in your Justdial workspace." },
      { property: "og:title", content: "Lead management \u2014 Justdial" },
      { property: "og:description", content: "Manage lead management in your Justdial workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allLeadsQ),
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(allLeadsQ);
  const act = async (p: PromiseLike<{ error: { message: string } | null }>, msg: string) => {
    const { error } = await p;
    if (error) toast.error(error.message);
    else {
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["admin"] });
    }
  };
  return (
    <>
      <PageTitle title="All leads" sub={`${data.length} enquiries across every business.`} />
      {data.length === 0 ? (
        <Empty title="No leads yet" />
      ) : (
        <div className="overflow-x-auto rounded-3xl border bg-card">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="p-4">Customer</th>
                <th className="p-4">Business</th>
                <th className="p-4">Message</th>
                <th className="p-4">When</th>
                <th className="p-4">Status</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map((l) => (
                <tr key={l.id}>
                  <td className="p-4">
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-muted-foreground">+91 {l.phone}</p>
                  </td>
                  <td className="p-4">{l.businesses?.name}</td>
                  <td className="max-w-xs truncate p-4 text-muted-foreground">
                    {l.message || "—"}
                  </td>
                  <td className="p-4 text-muted-foreground">{timeAgo(l.created_at)}</td>
                  <td className="p-4">
                    <select
                      value={l.status}
                      onChange={(e) =>
                        act(
                          supabase.from("leads").update({ status: e.target.value }).eq("id", l.id),
                          "Updated",
                        )
                      }
                      aria-label="Status"
                      className="h-9 rounded-lg border bg-background px-2 capitalize"
                    >
                      {["new", "contacted", "won", "lost"].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      aria-label="Delete lead"
                      onClick={() =>
                        confirm("Delete this lead?") &&
                        act(supabase.from("leads").delete().eq("id", l.id), "Deleted")
                      }
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
