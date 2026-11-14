import { describe, expect, it } from "vitest";
import { CITIES, searchBusinesses, type Business } from "./catalog";

const rows = [
  { id: "noida", name: "The Culinary Court", city: "Noida", category: "restaurants", sub: "Dining", area: "Sector 62", tags: [], sponsored: false },
  { id: "mumbai", name: "Mumbai Dining", city: "Mumbai", category: "restaurants", sub: "Dining", area: "Bandra", tags: [], sponsored: false },
] as Business[];
describe("Noida search", () => {
  it("includes Noida as a selectable city", () => expect(CITIES.includes("Noida")).toBe(true));
  it("shows only Noida businesses for a Noida category search", () => expect(searchBusinesses("Restaurants", "Noida", rows).map(b => b.id)).toEqual(["noida"]));
  it("keeps the city filter for an empty search", () => expect(searchBusinesses("", "Noida", rows).map(b => b.id)).toEqual(["noida"]));
});