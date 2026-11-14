import { describe, it, expect } from "vitest";
import { directoryResults, similarBusinesses } from "./directory-search";
import type { Business } from "@/data/catalog";
const business = (id: string, city = "Noida", extra: Partial<Business> = {}): Business => ({
  id,
  name: `Business ${id}`,
  city: city as Business["city"],
  area: "Sector 50",
  category: "interior-designers",
  sub: "",
  rating: 0,
  reviews: 0,
  years: 0,
  verified: false,
  trust: false,
  sponsored: false,
  open: null,
  distance: null,
  hours: "",
  phone: "",
  image: "",
  tags: [],
  highlight: "",
  price: "",
  services: [],
  reviewList: [],
  ...extra,
});
describe("public directory rules", () => {
  it("finds Gypsum Ceiling and its service synonym through a published offering", () => {
    const b = business("1", "Noida", { offeringTitles: ["Gypsum Ceiling"] });
    expect(
      directoryResults([b], { q: "Gypsum Ceiling", city: "Noida" }).results[0]?.matchedOfferings,
    ).toEqual(["Gypsum Ceiling"]);
    expect(directoryResults([b], { q: "false ceiling", city: "Noida" }).total).toBe(1);
  });
  it("never crosses cities for an offering match", () => {
    expect(
      directoryResults([business("1", "Delhi", { offeringTitles: ["Gypsum Ceiling"] })], {
        q: "Gypsum Ceiling",
        city: "Noida",
      }).total,
    ).toBe(0);
  });
  it("filters manual locality exactly", () => {
    expect(
      directoryResults([business("1"), business("2", "Noida", { area: "Sector 62" })], {
        city: "Noida",
        locality: "Sector 50",
      }).results.map((b) => b.id),
    ).toEqual(["1"]);
  });
  it("keeps accurate counts across ten-item pages", () => {
    const rows = Array.from({ length: 23 }, (_, i) => business(String(i)));
    const result = directoryResults(rows, { city: "Noida", page: 3 });
    expect(result.total).toBe(23);
    expect(result.pages).toBe(3);
    expect(result.results).toHaveLength(3);
  });
  it("sorts unrated businesses after rated ones", () => {
    expect(
      directoryResults([business("1"), business("2", "Noida", { reviews: 1, rating: 3 })], {
        city: "Noida",
        sort: "Rating",
      }).results.map((b) => b.id),
    ).toEqual(["2", "1"]);
  });
  it("similar recommendations never cross cities", () => {
    const b = business("1");
    expect(
      similarBusinesses([b, business("2", "Delhi"), business("3")], b).map((b) => b.id),
    ).toEqual(["3"]);
  });
  it("4.5 filter excludes unrated businesses", () => {
    expect(
      directoryResults([business("1"), business("2", "Noida", { reviews: 2, rating: 4.5 })], {
        city: "Noida",
        rated: true,
      }).results.map((b) => b.id),
    ).toEqual(["2"]);
  });
});
