import { useState } from "react";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Package, Pencil, Plus, Search, Trash2, Wrench } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "@/components/site/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OfferingForm } from "./offering-form";
import { Empty, PageTitle, Pill, inputCls } from "./shell";
import { offeringsQ } from "@/lib/offerings";
import { allBusinessesQ } from "@/lib/admin-data";
import { myBusinessesQ } from "@/lib/owner-data";
import { priceLabel, type OfferingInput } from "@/lib/offering-schema";
import { deleteOffering } from "@/lib/offerings.functions";

export function OfferingsManager({ ownerId }: { ownerId?: string }) {
  const { data: businesses } = useSuspenseQuery(ownerId ? myBusinessesQ(ownerId) : allBusinessesQ);
  const { data } = useSuspenseQuery(offeringsQ(undefined, ownerId));
  const [q, setQ] = useState("");
  const [business, setBusiness] = useState("");
  const [filter, setFilter] = useState("all");
  const [adding, setAdding] = useState<"product" | "service">();
  const [editing, setEditing] = useState<OfferingInput & { images: string[] }>();
  const [removing, setRemoving] = useState<{ id: string; name: string }>();
  const qc = useQueryClient();
  const remove = useServerFn(deleteOffering);
  const mutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      qc.invalidateQueries();
      setRemoving(undefined);
      toast.success("Item deleted");
    },
    onError: (e) => toast.error(e.message),
  });
  const list = data.filter(
    (x) =>
      (!business || x.business_id === business) &&
      (filter === "all" || x.kind === filter) &&
      `${x.name} ${x.category} ${x.business_name}`.toLowerCase().includes(q.toLowerCase()),
  );
  const close = () => {
    setAdding(undefined);
    setEditing(undefined);
  };
  return (
    <>
      <PageTitle
        title="Products & services"
        action={
          <div className="flex flex-wrap gap-2">
            <Btn
              variant="outline"
              disabled={!businesses.length}
              onClick={() => setAdding("service")}
            >
              <Wrench className="size-4" />
              Add service
            </Btn>
            <Btn disabled={!businesses.length} onClick={() => setAdding("product")}>
              <Plus className="size-4" />
              Add product
            </Btn>
          </div>
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <div className="flex gap-1">
          {["all", "product", "service"].map((t) => (
            <Btn
              key={t}
              variant={filter === t ? "ink" : "ghost"}
              aria-pressed={filter === t}
              className="capitalize"
              onClick={() => setFilter(t)}
            >
              {t === "all" ? "All" : `${t}s`} (
              {data.filter((x) => t === "all" || x.kind === t).length})
            </Btn>
          ))}
        </div>
        <select
          aria-label="Filter business"
          className={`${inputCls} sm:max-w-64`}
          value={business}
          onChange={(e) => setBusiness(e.target.value)}
        >
          <option value="">All businesses</option>
          {businesses.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border bg-card px-3">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <input
            aria-label="Search products and services"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products & services"
            className="w-full min-w-0 bg-transparent text-sm outline-none"
          />
        </label>
      </div>
      {!businesses.length ? (
        <Empty title="Add a business first" />
      ) : !list.length ? (
        <Empty
          title={data.length ? "No matching items" : "Your catalog starts here"}
          action={
            !data.length && (
              <Btn onClick={() => setAdding("service")}>
                <Plus className="size-4" />
                Add service
              </Btn>
            )
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="relative aspect-[4/3] bg-muted">
                {item.images[0] ? (
                  <img src={item.images[0]} alt={item.name} className="size-full object-cover" />
                ) : (
                  <div className="grid size-full place-items-center text-muted-foreground">
                    {item.kind === "product" ? (
                      <Package className="size-10" />
                    ) : (
                      <Wrench className="size-10" />
                    )}
                  </div>
                )}
                <div className="absolute left-3 top-3">
                  <Pill v={item.review_state ?? (item.published ? "published" : "draft")} />
                </div>
              </div>
              <div className="space-y-2 p-4">
                <p className="text-xs font-semibold text-coral">
                  {item.business_name} · {item.kind}
                </p>
                <h2 className="font-display text-lg font-bold">{item.name}</h2>
                <p className="text-sm text-muted-foreground">{item.category}</p>
                <p className="font-bold">{priceLabel(item.pricing)}</p>
                <div className="flex gap-2 border-t pt-3">
                  <Btn variant="outline" onClick={() => setEditing(item)}>
                    <Pencil className="size-4" />
                    Edit
                  </Btn>
                  <Btn
                    variant="ghost"
                    aria-label={`Delete ${item.name}`}
                    onClick={() => item.id && setRemoving({ id: item.id, name: item.name })}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Btn>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <Dialog open={Boolean(adding || editing)} onOpenChange={(o) => !o && close()}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">
              {editing ? "Edit" : "Add"} {editing?.kind ?? adding}
            </DialogTitle>
          </DialogHeader>
          {(adding || editing) && (
            <OfferingForm
              initial={editing}
              kind={editing?.kind ?? adding ?? "service"}
              businesses={businesses}
              onDone={close}
            />
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {removing?.name}?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This permanently removes the item from the business listing.
          </p>
          <div className="flex justify-end gap-2">
            <Btn variant="outline" onClick={() => setRemoving(undefined)}>
              Cancel
            </Btn>
            <Btn
              disabled={mutation.isPending}
              onClick={() => removing && mutation.mutate(removing.id)}
            >
              {mutation.isPending ? "Deleting…" : "Delete"}
            </Btn>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
