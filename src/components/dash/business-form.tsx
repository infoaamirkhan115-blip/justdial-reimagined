import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { CATEGORIES, CITIES } from "@/data/catalog";
import { Btn } from "@/components/site/ui";
import { inputCls } from "./shell";

type Row = Tables<"businesses">;
export function BusinessForm({ initial, ownerId, onDone }: { initial?: Row | undefined; ownerId: string; onDone: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: initial?.name ?? "", category: initial?.category ?? "restaurants", sub: initial?.sub ?? "", city: initial?.city ?? "Mumbai",
    area: initial?.area ?? "", address: initial?.address ?? "", phone: initial?.phone ?? "", price: initial?.price ?? "",
    hours: initial?.hours ?? "10:00 am – 8:00 pm", description: initial?.description ?? "", tags: (initial?.tags ?? []).join(", "),
  });
  const [busy, setBusy] = useState(false);
  const cat = CATEGORIES.find((c) => c.slug === f.category);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[6-9]\d{9}$/.test(f.phone)) { toast.error("Enter a valid 10-digit mobile number"); return; }
    setBusy(true);
    const payload = { ...f, name: f.name.trim(), tags: f.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8) };
    const { error } = initial
      ? await supabase.from("businesses").update(payload).eq("id", initial.id)
      : await supabase.from("businesses").insert({ ...payload, owner_id: ownerId });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success(initial ? "Changes saved" : "Business submitted for review. It goes live once approved.");
    qc.invalidateQueries();
    onDone();
  };
  const L = ({ label, children }: { label: string; children: React.ReactNode }) => <label className="block text-sm font-semibold">{label}<div className="mt-1 font-normal">{children}</div></label>;
  return (
    <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2"><L label="Business name"><input required maxLength={100} value={f.name} onChange={set("name")} className={inputCls} /></L></div>
      <L label="Category"><select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value, sub: "" })} className={inputCls}>{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></L>
      <L label="Speciality"><select value={f.sub} onChange={set("sub")} className={inputCls}><option value="">Choose…</option>{cat?.subs.map((s) => <option key={s}>{s}</option>)}</select></L>
      <L label="City"><select value={f.city} onChange={set("city")} className={inputCls}>{CITIES.map((c) => <option key={c}>{c}</option>)}</select></L>
      <L label="Area / locality"><input required maxLength={80} value={f.area} onChange={set("area")} className={inputCls} /></L>
      <div className="sm:col-span-2"><L label="Full address"><input maxLength={200} value={f.address} onChange={set("address")} className={inputCls} /></L></div>
      <L label="Mobile number"><input required inputMode="numeric" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} className={inputCls} /></L>
      <L label="Opening hours"><input maxLength={60} value={f.hours} onChange={set("hours")} className={inputCls} /></L>
      <L label="Price (e.g. ₹500 for two)"><input maxLength={60} value={f.price} onChange={set("price")} className={inputCls} /></L>
      <L label="Highlights (comma separated)"><input maxLength={200} value={f.tags} onChange={set("tags")} placeholder="Home delivery, Parking" className={inputCls} /></L>
      <div className="sm:col-span-2"><L label="About your business"><textarea rows={4} maxLength={1500} value={f.description} onChange={set("description")} className="w-full rounded-xl border border-input bg-background p-3 text-sm" /></L></div>
      <div className="flex justify-end gap-2 sm:col-span-2"><Btn type="button" variant="outline" onClick={onDone}>Cancel</Btn><Btn type="submit" disabled={busy}>{busy ? "Saving…" : initial ? "Save changes" : "Submit listing"}</Btn></div>
    </form>
  );
}
