import { describe, expect, it } from "vitest";
import { emptyDetails, emptyPricing, offeringSchema, pricingSchema, priceLabel } from "./offering-schema";
const item = { business_id: "00000000-0000-4000-8000-000000000001", kind: "service", name: "Interior work", category: "Interior", business_type: "Service provider", description: "", photos: [], pricing: emptyPricing, specifications: [], product_details: emptyDetails, published: true };
describe("offerings validation", () => {
  it("rejects caller-supplied ownership", () => expect(offeringSchema.safeParse({ ...item, owner_id: "00000000-0000-4000-8000-000000000002" }).success).toBe(false));
  it("rejects reversed price ranges", () => expect(pricingSchema.safeParse({ ...emptyPricing, mode: "range", price: 200, max: 100 }).success).toBe(false));
  it("rejects overlapping quantity ranges", () => expect(pricingSchema.safeParse({ ...emptyPricing, mode: "quantity", tiers: [{ min: 1, max: 10, price: 100 }, { min: 10, max: 20, price: 90 }] }).success).toBe(false));
  it("rejects discounts greater than price", () => expect(pricingSchema.safeParse({ ...emptyPricing, price: 100, discount: 101 }).success).toBe(false));
  it("displays actual discounted price", () => expect(priceLabel({ ...emptyPricing, price: 100, discount: 20 })).toBe("₹80"));
  it("requires a business for every item", () => expect(offeringSchema.safeParse({ ...item, business_id: "" }).success).toBe(false));
});