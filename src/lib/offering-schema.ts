import { z } from "zod";

const amount = z.number().finite().min(0).max(1_000_000_000);
export const pricingSchema = z.object({
  mode: z.enum(["single", "range", "quantity", "quote"]),
  price: amount.default(0), max: amount.default(0), discount: amount.default(0),
  unit: z.string().trim().max(40).default(""),
  tiers: z.array(z.object({ min: z.number().int().min(1), max: z.number().int().min(1).nullable(), price: amount })).max(20).default([]),
}).superRefine((p, ctx) => {
  if (p.mode === "range" && p.max < p.price) ctx.addIssue({ code: "custom", message: "Maximum price must be at least the minimum price" });
  if (p.discount > p.price && p.mode === "single") ctx.addIssue({ code: "custom", message: "Discount cannot exceed the price" });
  if (p.mode === "quantity" && !p.tiers.length) ctx.addIssue({ code: "custom", message: "Add a quantity price range" });
  let last = 0;
  p.tiers.forEach((t, i) => {
    if (t.min <= last || (t.max !== null && t.max < t.min) || (t.max === null && i !== p.tiers.length - 1)) ctx.addIssue({ code: "custom", message: "Quantity ranges must be ordered and cannot overlap" });
    last = t.max ?? Infinity;
  });
});
export const offeringSchema = z.object({
  id: z.string().uuid().optional(), business_id: z.string().uuid(), kind: z.enum(["product", "service"]),
  name: z.string().trim().min(1, "Enter a name").max(120), category: z.string().trim().max(120),
  business_type: z.string().trim().max(60), description: z.string().trim().max(3000),
  photos: z.array(z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z0-9]+$/)).max(10),
  pricing: pricingSchema,
  specifications: z.array(z.object({ name: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(300) })).max(30),
  product_details: z.object({ brand: z.string().max(120), manufacturer: z.string().max(200), transaction: z.enum(["enquiry", "online"]), stock: z.number().int().min(0), mrp: amount, minimum_order: z.number().int().min(1), order_unit: z.string().max(40), weight: amount, length: amount, width: amount, height: amount, origin: z.string().max(100) }),
  published: z.boolean(),
  review_state: z.enum(["draft","review","published"]).optional(),
  inclusions: z.string().max(3000).optional(), exclusions: z.string().max(3000).optional(),
  minimum_quantity: z.number().min(0).nullable().optional(), minimum_area: z.number().min(0).nullable().optional(),
}).strict();
export type OfferingInput = z.infer<typeof offeringSchema>;
export type Pricing = z.infer<typeof pricingSchema>;
export const emptyDetails: OfferingInput["product_details"] = { brand: "", manufacturer: "", transaction: "enquiry", stock: 0, mrp: 0, minimum_order: 1, order_unit: "piece", weight: 0, length: 0, width: 0, height: 0, origin: "" };
export const emptyPricing: Pricing = { mode: "single", price: 0, max: 0, discount: 0, unit: "", tiers: [] };
export function priceLabel(p: Pricing) {
  const rupee = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  if (p.mode === "quote") return "Price on request";
  if (p.mode === "range") return `${rupee(p.price)} – ${rupee(p.max)}${p.unit ? ` / ${p.unit}` : ""}`;
  if (p.mode === "quantity") return p.tiers.length ? `From ${rupee(Math.min(...p.tiers.map(t => t.price)))}${p.unit ? ` / ${p.unit}` : ""}` : "Price on request";
  return `${rupee(p.price - p.discount)}${p.unit ? ` / ${p.unit}` : ""}`;
}