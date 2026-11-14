import { describe, expect, it } from "vitest";
import { listingAiSchema, listingAiResultSchema } from "./listing-ai-schema";

const details = { name: "Desire Home Interior", category: "Interior designers", sub: "", city: "Mumbai", area: "Andheri", description: "", highlights: "", year: "", price: "", hours: "", days: [], payments: [], services: [], photoCount: 0, hasLogo: false, hasAddress: false, hasLandmark: false, hasPincode: false, hasPhone: true, hasWhatsapp: false, hasEmail: false, hasWebsite: false, extraDetails: "Gypsum ceilings for offices" };
describe("listing AI validation", () => {
  it("requires owner-provided business name and locality", () => {
    expect(listingAiSchema.safeParse({ ...details, name: "" }).success).toBe(false);
    expect(listingAiSchema.safeParse({ ...details, area: "" }).success).toBe(false);
    expect(listingAiSchema.safeParse(details).success).toBe(true);
  });
  it("rejects private contact values and caller-supplied ownership", () => {
    expect(listingAiSchema.safeParse({ ...details, phone: "9876543210" }).success).toBe(false);
    expect(listingAiSchema.safeParse({ ...details, owner_id: "someone-else" }).success).toBe(false);
  });
  it("keeps generated descriptions within the listing's 1500-character capacity", () => {
    const suggestion = { title: "Add photos", action: "Upload a completed ceiling project.", priority: "high" };
    expect(listingAiResultSchema.safeParse({ description: "a".repeat(1501), suggestions: [suggestion] }).success).toBe(false);
    expect(listingAiResultSchema.safeParse({ description: "a".repeat(1500), suggestions: [suggestion] }).success).toBe(true);
  });
});