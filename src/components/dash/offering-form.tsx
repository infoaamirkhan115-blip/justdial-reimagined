import { useRef, useState, type ReactNode } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, Plus, Star, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "@/components/site/ui";
import { inputCls } from "./shell";
import { supabase } from "@/integrations/supabase/client";
import { uploadPhoto } from "@/lib/photos";
import {
  emptyDetails,
  emptyPricing,
  offeringSchema,
  type OfferingInput,
} from "@/lib/offering-schema";
import { saveOffering } from "@/lib/offerings.functions";
import { useDirectoryDefinitions } from "@/lib/managed-directory";
import { useAuth } from "@/lib/auth";
import { placeholderContent } from "@/lib/directory-quality";

type Choice = { id: string; name: string; category?: string };
function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-1.5 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-t pt-5">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {children}
    </section>
  );
}
export function OfferingForm({
  initial,
  kind,
  businesses,
  onDone,
}: {
  initial?: (OfferingInput & { images?: string[] }) | undefined;
  kind: "product" | "service";
  businesses: Choice[];
  onDone: () => void;
}) {
  const { categories: CATEGORIES } = useDirectoryDefinitions();
  const { isAdmin } = useAuth();
  const [preview, setPreview] = useState(false);
  const [f, setF] = useState<OfferingInput>(() => ({
    ...(initial?.id ? { id: initial.id } : {}),
    business_id: initial?.business_id ?? businesses[0]?.id ?? "",
    kind: initial?.kind ?? kind,
    review_state: initial?.review_state ?? "draft",
    inclusions: initial?.inclusions ?? "",
    exclusions: initial?.exclusions ?? "",
    minimum_quantity: initial?.minimum_quantity ?? null,
    minimum_area: initial?.minimum_area ?? null,
    name: initial?.name ?? "",
    category: initial?.category ?? "",
    business_type: initial?.business_type ?? "",
    description: initial?.description ?? "",
    photos: initial?.photos ?? [],
    pricing: initial?.pricing ?? { ...emptyPricing },
    specifications: initial?.specifications ?? [],
    product_details: initial?.product_details ?? { ...emptyDetails },
    published: initial?.published ?? true,
  }));
  const [images, setImages] = useState(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();
  const save = useServerFn(saveOffering);
  const mutation = useMutation({
    mutationFn: (data: OfferingInput) => save({ data }),
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Item saved");
      onDone();
    },
    onError: (e) => toast.error(e.message),
  });
  const update = <K extends keyof OfferingInput>(k: K, v: OfferingInput[K]) =>
    setF((x) => ({ ...x, [k]: v }));
  const price = (k: keyof OfferingInput["pricing"], v: unknown) =>
    setF((x) => ({ ...x, pricing: { ...x.pricing, [k]: v } }));
  const detail = (k: keyof OfferingInput["product_details"], v: string | number) =>
    setF((x) => ({ ...x, product_details: { ...x.product_details, [k]: v } }));
  const numeric = (label: string, value: number, change: (n: number) => void, min = 0) => (
    <Field label={label}>
      <input
        type="number"
        min={min}
        step="any"
        value={value}
        onChange={(e) => change(Number(e.target.value))}
        className={inputCls}
      />
    </Field>
  );
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const selectedFiles = Array.from(files).slice(0, 10 - f.photos.length);
    setUploading(true);
    try {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Please sign in again");
      for (const file of selectedFiles) {
        const path = await uploadPhoto(file, data.user.id);
        setF((x) => ({ ...x, photos: [...x.photos, path] }));
        setImages((x) => [...x, URL.createObjectURL(file)]);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };
  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const parsed = offeringSchema.safeParse(f);
        if (!parsed.success) {
          toast.error(parsed.error.issues[0]?.message ?? "Check the form");
          return;
        }
        if (
          parsed.data.review_state === "published" &&
          placeholderContent(parsed.data.description)
        ) {
          toast.error("Correct development or placeholder content before publication");
          return;
        }
        mutation.mutate(parsed.data);
      }}
    >
      <Field label="Business">
        <select
          aria-label="Business"
          className={inputCls}
          disabled={Boolean(initial)}
          value={f.business_id}
          onChange={(e) => update("business_id", e.target.value)}
          required
        >
          <option value="">Select business</option>
          {businesses.map((b) => (
            <option value={b.id} key={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {f.photos.map((p, i) => (
          <div
            key={p}
            className="relative aspect-square overflow-hidden rounded-xl border bg-muted"
          >
            <img
              src={images[i]}
              alt={`${f.name || "Item"} photo ${i + 1}`}
              className="size-full object-cover"
            />
            <Btn
              type="button"
              variant="outline"
              className="absolute right-1 top-1 min-h-7 px-1"
              aria-label="Remove item photo"
              onClick={() => {
                update(
                  "photos",
                  f.photos.filter((_, n) => n !== i),
                );
                setImages((x) => x.filter((_, n) => n !== i));
              }}
            >
              <X className="size-4" />
            </Btn>
            <Btn
              type="button"
              variant={i === 0 ? "primary" : "outline"}
              className="absolute bottom-1 left-1 min-h-7 px-1"
              aria-label="Set primary photo"
              title="Primary photo"
              onClick={() => {
                update("photos", [p, ...f.photos.filter((_, n) => n !== i)]);
                setImages((x) => [x[i] ?? "", ...x.filter((_, n) => n !== i)]);
              }}
            >
              <Star className="size-4" />
            </Btn>
          </div>
        ))}
        {f.photos.length < 10 && (
          <Btn
            type="button"
            variant="outline"
            className="aspect-square flex-col border-dashed"
            disabled={uploading}
            onClick={() => photoInput.current?.click()}
          >
            <ImagePlus className="size-6" />
            {uploading ? "Uploading…" : "Add photos"}
          </Btn>
        )}
        <input
          aria-label="Item photos"
          ref={photoInput}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            upload(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
      <Field label={f.kind === "product" ? "Product name" : "Service name"}>
        <input
          required
          maxLength={120}
          value={f.name}
          onChange={(e) => update("name", e.target.value)}
          className={inputCls}
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category">
          <input
            list="offering-categories"
            maxLength={120}
            value={f.category}
            onChange={(e) => update("category", e.target.value)}
            className={inputCls}
          />
          <datalist id="offering-categories">
            {CATEGORIES.flatMap((c) => [c.name, ...c.subs]).map((c, i) => (
              <option key={i} value={c} />
            ))}
          </datalist>
        </Field>
        <Field label="Business type">
          <select
            value={f.business_type}
            onChange={(e) => update("business_type", e.target.value)}
            className={inputCls}
          >
            <option value="">Select type</option>
            {[
              "Retailer",
              "Wholesaler",
              "Distributor",
              "Exporter",
              "Importer",
              "Manufacturer",
              "Service provider",
            ].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </Field>
      </div>
      <Section title="Pricing">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Pricing type">
          {(
            [
              { key: "single", label: "Single price" },
              { key: "range", label: "Price range" },
              { key: "quantity", label: "Quantity pricing" },
              { key: "quote", label: "On request" },
            ] as const
          ).map((m) => (
            <Btn
              type="button"
              key={m.key}
              variant={f.pricing.mode === m.key ? "ink" : "outline"}
              aria-pressed={f.pricing.mode === m.key}
              onClick={() => price("mode", m.key)}
            >
              {m.label}
            </Btn>
          ))}
        </div>
        {f.pricing.mode !== "quote" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {f.pricing.mode !== "quantity" &&
              numeric(
                f.pricing.mode === "range" ? "Minimum price (₹)" : "Price (₹)",
                f.pricing.price,
                (v) => price("price", v),
              )}
            {f.pricing.mode === "range" &&
              numeric("Maximum price (₹)", f.pricing.max, (v) => price("max", v))}
            {f.pricing.mode === "single" &&
              numeric("Discount (₹)", f.pricing.discount, (v) => price("discount", v))}
            <Field label="Price per">
              <input
                list="price-units"
                value={f.pricing.unit}
                maxLength={40}
                onChange={(e) => price("unit", e.target.value)}
                className={inputCls}
              />
              <datalist id="price-units">
                {["piece", "sq ft", "hour", "day", "visit", "kg", "service"].map((u) => (
                  <option key={u}>{u}</option>
                ))}
              </datalist>
            </Field>
          </div>
        )}
        {f.pricing.mode === "quantity" && (
          <div className="space-y-3">
            {f.pricing.tiers.map((t, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] items-end gap-2">
                {numeric(
                  "Min qty",
                  t.min,
                  (v) =>
                    price(
                      "tiers",
                      f.pricing.tiers.map((x, n) => (n === i ? { ...x, min: v } : x)),
                    ),
                  1,
                )}
                <Field label="Max qty">
                  <input
                    type="number"
                    min={1}
                    placeholder="No limit"
                    value={t.max ?? ""}
                    onChange={(e) =>
                      price(
                        "tiers",
                        f.pricing.tiers.map((x, n) =>
                          n === i
                            ? { ...x, max: e.target.value ? Number(e.target.value) : null }
                            : x,
                        ),
                      )
                    }
                    className={inputCls}
                  />
                </Field>
                {numeric("Price (₹)", t.price, (v) =>
                  price(
                    "tiers",
                    f.pricing.tiers.map((x, n) => (n === i ? { ...x, price: v } : x)),
                  ),
                )}
                <Btn
                  type="button"
                  variant="ghost"
                  aria-label="Remove price range"
                  onClick={() =>
                    price(
                      "tiers",
                      f.pricing.tiers.filter((_, n) => n !== i),
                    )
                  }
                >
                  <Trash2 className="size-4" />
                </Btn>
              </div>
            ))}
            <Btn
              type="button"
              variant="outline"
              onClick={() =>
                price("tiers", [
                  ...f.pricing.tiers,
                  { min: (f.pricing.tiers.at(-1)?.max ?? 0) + 1, max: null, price: 0 },
                ])
              }
            >
              <Plus className="size-4" />
              Add range
            </Btn>
          </div>
        )}
      </Section>
      <Section title="Description">
        <Field label="Description">
          <textarea
            aria-label="Description"
            rows={5}
            maxLength={3000}
            value={f.description}
            onChange={(e) => update("description", e.target.value)}
            className="w-full rounded-xl border border-input bg-background p-3 text-sm font-normal"
          />
        </Field>
        <p className="text-right text-xs text-muted-foreground">{f.description.length}/3000</p>
      </Section>
      {f.kind === "product" && (
        <Section title="Product details">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand">
              <input
                value={f.product_details.brand}
                maxLength={120}
                onChange={(e) => detail("brand", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Manufacturer">
              <input
                value={f.product_details.manufacturer}
                maxLength={200}
                onChange={(e) => detail("manufacturer", e.target.value)}
                className={inputCls}
              />
            </Field>
            {numeric("In stock (qty)", f.product_details.stock, (v) => detail("stock", v))}
            {numeric("MRP (₹)", f.product_details.mrp, (v) => detail("mrp", v))}
            {numeric(
              "Minimum order quantity",
              f.product_details.minimum_order,
              (v) => detail("minimum_order", v),
              1,
            )}
            <Field label="Order unit">
              <input
                value={f.product_details.order_unit}
                maxLength={40}
                onChange={(e) => detail("order_unit", e.target.value)}
                className={inputCls}
              />
            </Field>
            {numeric("Package weight (kg)", f.product_details.weight, (v) => detail("weight", v))}
            {numeric("Length (cm)", f.product_details.length, (v) => detail("length", v))}
            {numeric("Width (cm)", f.product_details.width, (v) => detail("width", v))}
            {numeric("Height (cm)", f.product_details.height, (v) => detail("height", v))}
            <Field label="Country of origin">
              <input
                value={f.product_details.origin}
                maxLength={100}
                onChange={(e) => detail("origin", e.target.value)}
                className={inputCls}
              />
            </Field>
          </div>
        </Section>
      )}
      <Section title="Category specifications">
        {(
          CATEGORIES.find(
            (c) => c.slug === businesses.find((b) => b.id === f.business_id)?.category,
          )?.fields ?? []
        ).map((field) => (
          <Field label={field.label} key={field.key}>
            <input
              value={f.specifications.find((s) => s.name === field.label)?.value ?? ""}
              onChange={(e) =>
                update(
                  "specifications",
                  [
                    ...f.specifications.filter((s) => s.name !== field.label),
                    { name: field.label, value: e.target.value },
                  ].filter((s) => s.value),
                )
              }
              className={inputCls}
            />
          </Field>
        ))}
      </Section>
      <Section title="Specifications">
        <div className="space-y-3">
          {f.specifications.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                aria-label="Specification name"
                placeholder="e.g. Material"
                maxLength={80}
                value={s.name}
                onChange={(e) =>
                  update(
                    "specifications",
                    f.specifications.map((x, n) => (n === i ? { ...x, name: e.target.value } : x)),
                  )
                }
                className={inputCls}
              />
              <input
                aria-label="Specification value"
                placeholder="Value"
                maxLength={300}
                value={s.value}
                onChange={(e) =>
                  update(
                    "specifications",
                    f.specifications.map((x, n) => (n === i ? { ...x, value: e.target.value } : x)),
                  )
                }
                className={inputCls}
              />
              <Btn
                type="button"
                variant="ghost"
                aria-label="Remove specification"
                onClick={() =>
                  update(
                    "specifications",
                    f.specifications.filter((_, n) => n !== i),
                  )
                }
              >
                <Trash2 className="size-4" />
              </Btn>
            </div>
          ))}
          <Btn
            type="button"
            variant="outline"
            onClick={() => update("specifications", [...f.specifications, { name: "", value: "" }])}
          >
            <Plus className="size-4" />
            Add specification
          </Btn>
        </div>
      </Section>
      <Section title="Scope & minimums">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Inclusions">
            <textarea
              value={f.inclusions ?? ""}
              onChange={(e) => update("inclusions", e.target.value)}
              className="rounded-xl border bg-background p-3"
            />
          </Field>
          <Field label="Exclusions">
            <textarea
              value={f.exclusions ?? ""}
              onChange={(e) => update("exclusions", e.target.value)}
              className="rounded-xl border bg-background p-3"
            />
          </Field>
          <Field label="Minimum quantity">
            <input
              type="number"
              min={0}
              value={f.minimum_quantity ?? ""}
              onChange={(e) =>
                update("minimum_quantity", e.target.value ? Number(e.target.value) : null)
              }
              className={inputCls}
            />
          </Field>
          <Field label="Minimum area (sq ft)">
            <input
              type="number"
              min={0}
              value={f.minimum_area ?? ""}
              onChange={(e) =>
                update("minimum_area", e.target.value ? Number(e.target.value) : null)
              }
              className={inputCls}
            />
          </Field>
        </div>
      </Section>
      <Field label="Publication state">
        <select
          value={f.review_state ?? "draft"}
          onChange={(e) => {
            const value = e.target.value as "draft" | "review" | "published";
            setF({ ...f, review_state: value, published: value === "published" });
          }}
          className={inputCls}
        >
          <option value="draft">Draft</option>
          <option value="review">Submit for review</option>
          {isAdmin && <option value="published">Approve publication</option>}
        </select>
      </Field>
      <Btn type="button" variant="outline" onClick={() => setPreview(!preview)}>
        Public preview
      </Btn>
      {preview && (
        <article className="space-y-3 border-y py-5">
          {images[0] && (
            <img
              src={images[0]}
              alt={f.name}
              className="aspect-[4/3] max-h-72 w-full rounded-xl object-cover"
            />
          )}
          <h3 className="text-xl font-bold">{f.name}</h3>
          <p className="whitespace-pre-wrap text-sm">{f.description}</p>
          <p className="text-sm">{f.inclusions}</p>
          {f.specifications.map((s, i) => (
            <p key={i} className="text-sm">
              {s.name}: {s.value}
            </p>
          ))}
          <p className="text-xs text-muted-foreground">Preview only · {f.review_state}</p>
        </article>
      )}
      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-card py-4">
        <Btn type="button" variant="outline" onClick={onDone}>
          Cancel
        </Btn>
        <Btn type="submit" disabled={uploading || mutation.isPending || !businesses.length}>
          {mutation.isPending ? "Saving…" : "Save"}
        </Btn>
      </div>
    </form>
  );
}
