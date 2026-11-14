import { useServerFn } from "@tanstack/react-start";
import { archiveBusiness } from "@/lib/directory-management.functions";
import { changeListingTrust } from "@/lib/trust.functions";
import { completeness } from "@/lib/directory-quality";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, ExternalLink, Megaphone, Pencil, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { allBusinessesQ } from "@/lib/admin-data";
import { getCategory } from "@/data/catalog";
import { BusinessForm } from "@/components/dash/business-form";
import { Empty, PageTitle, Pill, timeAgo } from "@/components/dash/shell";
import { Btn } from "@/components/site/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const STATUSES = ["all", "pending", "approved", "rejected", "suspended", "archived"] as const;
type S = { status?: string | undefined };
export const Route = createFileRoute("/_authenticated/admin/businesses")({
  head: () => ({
    meta: [
      { title: "Business management — Justdial Admin" },
      {
        name: "description",
        content: "Review and manage Justdial business listings, approvals, and profile details.",
      },
      { property: "og:title", content: "Business management — Justdial Admin" },
      { property: "og:description", content: "Manage business approvals and listing profiles." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): S => ({
    status: typeof s["status"] === "string" ? s["status"] : undefined,
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(allBusinessesQ),
  component: Page,
});

function Page() {
  const { status = "all" } = Route.useSearch();
  const nav = useNavigate({ from: Route.fullPath });
  const qc = useQueryClient();
  const archive = useServerFn(archiveBusiness);
  const changeTrust = useServerFn(changeListingTrust);
  const { data } = useSuspenseQuery(allBusinessesQ);
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Tables<"businesses"> | undefined>();
  const list = data.filter(
    (b) =>
      (status === "all" || b.status === status) &&
      (b.name + b.city + b.area + b.phone).toLowerCase().includes(q.toLowerCase()),
  );

  const set = async (id: string, patch: Partial<Tables<"businesses">>, msg: string) => {
    const reason = prompt("Reason for this listing or entitlement change");
    if (!reason) return;
    try {
      await changeTrust({ data: { id, patch: JSON.parse(JSON.stringify(patch)), reason } });
      toast.success(msg);
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Change denied");
    }
  };
  const remove = async (b: Tables<"businesses">) => {
    if (
      !confirm(
        `${b.archived_at ? "Restore" : "Archive"} "${b.name}"? Linked records are preserved.`,
      )
    )
      return;
    try {
      await archive({ data: { id: b.id, restore: Boolean(b.archived_at) } });
      toast.success(b.archived_at ? "Restored" : "Archived");
      qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not archive");
    }
  };

  return (
    <>
      <PageTitle
        title="Businesses"
        sub="Approve listings, set plans, verify and feature businesses."
      />
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => nav({ search: { status: s === "all" ? undefined : s } })}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-sm font-semibold capitalize",
                status === s ? "border-ink bg-ink text-ink-foreground" : "bg-card",
              )}
            >
              {s} {s === "all" ? data.length : data.filter((b) => b.status === s).length}
            </button>
          ))}
        </div>
        <label className="flex h-10 items-center gap-2 rounded-xl border bg-card px-3 md:ml-auto md:w-72">
          <Search className="size-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, city, phone"
            aria-label="Search businesses"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      {list.length === 0 ? (
        <Empty title="Nothing here" />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <div key={b.id} className="rounded-3xl border bg-card p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{b.name}</h3>
                    <Pill v={b.status} />
                    <Pill v={b.plan} />
                    {b.requested_plan && (
                      <span className="text-xs font-bold text-coral">wants {b.requested_plan}</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {getCategory(b.category)?.name}
                    {b.sub && ` · ${b.sub}`} · {b.area}, {b.city} · {b.phone} · added{" "}
                    {timeAgo(b.created_at)}
                  </p>
                  {b.description && <p className="mt-1 line-clamp-2 text-sm">{b.description}</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={b.status}
                    onChange={(e) =>
                      set(b.id, { status: e.target.value }, `Status: ${e.target.value}`)
                    }
                    aria-label="Status"
                    className="h-10 rounded-xl border bg-background px-3 text-sm font-semibold capitalize"
                  >
                    {STATUSES.slice(1).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    value={b.plan}
                    onChange={(e) =>
                      set(
                        b.id,
                        { plan: e.target.value, requested_plan: null },
                        `Plan: ${e.target.value}`,
                      )
                    }
                    aria-label="Plan"
                    className="h-10 rounded-xl border bg-background px-3 text-sm font-semibold capitalize"
                  >
                    {["free", "premium", "platinum"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <Link
                    to="/admin/verification"
                    className="inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-bold"
                  >
                    <BadgeCheck className="size-4" />
                    Information checks
                  </Link>
                  <button
                    onClick={() =>
                      set(
                        b.id,
                        { sponsored: !b.sponsored },
                        b.sponsored ? "Removed from sponsored" : "Now sponsored",
                      )
                    }
                    aria-pressed={b.sponsored}
                    className={cn(
                      "inline-flex h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-bold",
                      b.sponsored ? "border-primary bg-saffron-soft" : "bg-background",
                    )}
                  >
                    <Megaphone className="size-4" />
                    Sponsored
                  </button>
                  {b.status === "approved" && (
                    <Link
                      to="/business/$id"
                      params={{ id: b.id }}
                      aria-label="View"
                      className="grid size-10 place-items-center rounded-xl border hover:bg-muted"
                    >
                      <ExternalLink className="size-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => setEditing(b)}
                    aria-label="Edit"
                    className="grid size-10 place-items-center rounded-xl border hover:bg-muted"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => remove(b)}
                    aria-label={b.archived_at ? "Restore listing" : "Archive listing"}
                    className="grid size-10 place-items-center rounded-xl border hover:bg-muted"
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </button>
                </div>
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const v = new FormData(e.currentTarget).get("note");
                  set(b.id, { owner_feedback: String(v ?? "").trim() }, "Note saved");
                }}
              >
                <input
                  name="note"
                  defaultValue={b.owner_feedback}
                  maxLength={300}
                  placeholder="Feedback to owner (private staff notes are in Quality centre)"
                  className="h-9 flex-1 rounded-xl border border-input bg-background px-3 text-sm"
                />
                <Btn type="submit" variant="outline" className="min-h-9">
                  Save note
                </Btn>
              </form>
            </div>
          ))}
        </div>
      )}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(undefined)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Edit listing</DialogTitle>
          </DialogHeader>
          {editing && (
            <BusinessForm
              key={editing.id}
              initial={editing}
              ownerId={editing.owner_id}
              onDone={() => setEditing(undefined)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
