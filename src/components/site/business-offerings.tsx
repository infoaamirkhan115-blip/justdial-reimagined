import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Wrench } from "lucide-react";
import { offeringsQ } from "@/lib/offerings";
import { priceLabel } from "@/lib/offering-schema";
import { Btn } from "./ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EnquiryPopup } from "./enquiry-popup";

export function BusinessOfferings({ businessId, businessName = "this business", businessImage, location }: { businessId: string; businessName?: string; businessImage?: string; location?: string }) {
  const { data = [], isLoading, error } = useQuery(offeringsQ(businessId));
  const [selectedId, setSelectedId] = useState<string>();
  const [photo, setPhoto] = useState(0);
  const selected = data.find(x => x.id === selectedId);
  if (isLoading) return <p className="py-8 text-muted-foreground">Loading products & services…</p>;
  if (error) return <p className="py-8 text-muted-foreground">Products and services are unavailable right now.</p>;
  return <>
    {!data.length && <p className="py-6 text-muted-foreground">No products or services added yet.</p>}
    <div className="grid gap-4 sm:grid-cols-2">{data.map(item => <article key={item.id} className="overflow-hidden rounded-2xl border bg-card">
      <div className="aspect-[4/3] bg-muted">{item.images[0] ? <img src={item.images[0]} alt={item.name} className="size-full object-cover" loading="lazy" /> : <div className="grid size-full place-items-center text-muted-foreground">{item.kind === "product" ? <Package className="size-12" /> : <Wrench className="size-12" />}</div>}</div>
      <div className="space-y-2 p-4"><p className="text-xs font-semibold uppercase text-coral">{item.kind} · {item.category}</p><h3 className="font-display text-lg font-bold">{item.name}</h3><p className="font-bold">{priceLabel(item.pricing)}</p><p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p><Btn variant="outline" onClick={() => { setSelectedId(item.id); setPhoto(0); }}>View details</Btn></div>
    </article>)}</div>
    <Dialog open={Boolean(selected)} onOpenChange={o => !o && setSelectedId(undefined)}><DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle className="font-display text-2xl">{selected?.name}</DialogTitle></DialogHeader>{selected && <div className="space-y-5">
      {selected.images.length > 0 && <div><img src={selected.images[photo]} alt={selected.name} className="aspect-[4/3] w-full rounded-xl object-contain bg-muted" /><div className="mt-2 flex gap-2 overflow-x-auto">{selected.images.map((src, i) => <Btn key={src} variant={i === photo ? "primary" : "outline"} aria-label={`View photo ${i + 1}`} className="size-16 shrink-0 overflow-hidden p-1" onClick={() => setPhoto(i)}><img src={src} alt="" className="size-full rounded-lg object-cover" /></Btn>)}</div></div>}
      <p className="text-xl font-bold">{priceLabel(selected.pricing)}</p>
      {selected.pricing.mode === "single" && selected.pricing.discount > 0 && <p className="text-sm text-muted-foreground"><s>₹{selected.pricing.price.toLocaleString("en-IN")}</s> · Save ₹{selected.pricing.discount.toLocaleString("en-IN")}</p>}
      {selected.pricing.mode === "quantity" && <table className="w-full text-left text-sm"><thead><tr className="border-b"><th className="py-2">Quantity</th><th>Price{selected.pricing.unit ? ` / ${selected.pricing.unit}` : ""}</th></tr></thead><tbody>{selected.pricing.tiers.map((t, i) => <tr key={i} className="border-b"><td className="py-2">{t.min}{t.max ? `–${t.max}` : "+"}</td><td>₹{t.price.toLocaleString("en-IN")}</td></tr>)}</tbody></table>}
      <p className="whitespace-pre-line text-sm leading-relaxed">{selected.description}</p>
      <dl className="divide-y text-sm">{[
        ["Category", selected.category], ["Business type", selected.business_type],
        ...(selected.kind === "product" ? [["Brand", selected.product_details.brand], ["Manufacturer", selected.product_details.manufacturer], ["MRP", selected.product_details.mrp ? `₹${selected.product_details.mrp.toLocaleString("en-IN")}` : ""], ["In stock", `${selected.product_details.stock}`], ["Minimum order", `${selected.product_details.minimum_order} ${selected.product_details.order_unit}`], ["Weight", selected.product_details.weight ? `${selected.product_details.weight} kg` : ""], ["Package dimensions", selected.product_details.length || selected.product_details.width || selected.product_details.height ? `${selected.product_details.length} × ${selected.product_details.width} × ${selected.product_details.height} cm` : ""], ["Country of origin", selected.product_details.origin]] : []),
        ...selected.specifications.map(s => [s.name, s.value]),
      ].filter(([, v]) => v).map(([k, v], i) => <div key={i} className="grid grid-cols-2 gap-3 py-3"><dt className="font-semibold">{k}</dt><dd className="break-words text-muted-foreground">{v}</dd></div>)}</dl>
      <EnquiryPopup label="Send enquiry" context={{ businessId, businessName, title: selected.name, image: selected.images[0] || businessImage, location, price: priceLabel(selected.pricing), description: selected.description }} />
    </div>}</DialogContent></Dialog>
  </>;
}