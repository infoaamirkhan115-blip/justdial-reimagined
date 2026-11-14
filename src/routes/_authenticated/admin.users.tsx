import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { allUsersQ } from "@/lib/admin-data";
import { PageTitle, timeAgo } from "@/components/dash/shell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/admin/users")({
  loader: ({ context }) => context.queryClient.ensureQueryData(allUsersQ),
  component: Page,
});

function Page() {
  const { user } = Route.useRouteContext();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(allUsersQ);
  const [q, setQ] = useState("");
  const list = data.filter((u) => ((u.full_name ?? "") + (u.email ?? "")).toLowerCase().includes(q.toLowerCase()));
  const toggle = async (uid: string, role: "admin" | "business_owner", has: boolean) => {
    const { error } = has ? await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", role) : await supabase.from("user_roles").insert({ user_id: uid, role });
    if (error) toast.error(error.message); else { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin", "users"] }); }
  };
  return (
    <>
      <PageTitle title="Users" sub="Everyone with an account. Give trusted team members admin access." action={<label className="flex h-10 w-72 items-center gap-2 rounded-xl border bg-card px-3"><Search className="size-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email" aria-label="Search users" className="flex-1 bg-transparent text-sm outline-none" /></label>} />
      <div className="overflow-x-auto rounded-3xl border bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="p-4">User</th><th className="p-4">Joined</th><th className="p-4">Listings</th><th className="p-4">Roles</th></tr></thead>
          <tbody className="divide-y">{list.map((u) => (
            <tr key={u.id}>
              <td className="p-4"><p className="font-semibold">{u.full_name || "—"}{u.id === user.id && <span className="ml-2 text-xs text-muted-foreground">(you)</span>}</p><p className="text-muted-foreground">{u.email}</p></td>
              <td className="p-4 text-muted-foreground">{timeAgo(u.created_at)}</td>
              <td className="p-4">{u.listings}</td>
              <td className="p-4"><div className="flex gap-2">{(["business_owner", "admin"] as const).map((r) => { const has = u.roles.includes(r); const self = u.id === user.id && r === "admin"; return (
                <button key={r} disabled={self} onClick={() => toggle(u.id, r, has)} aria-pressed={has} className={cn("rounded-full border px-3 py-1 text-xs font-bold disabled:opacity-60", has ? (r === "admin" ? "border-ink bg-ink text-ink-foreground" : "border-success bg-success-soft text-success") : "bg-background text-muted-foreground")}>{r === "admin" ? "Admin" : "Business owner"}</button>); })}</div></td>
            </tr>))}</tbody>
        </table>
      </div>
    </>
  );
}
