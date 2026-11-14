import { describe, expect, it } from "vitest";
import {
  categorySchema,
  completeness,
  duplicateCandidates,
  importRowSchema,
  parseCsv,
  placeholderContent,
  qualityIssues,
} from "./directory-quality";
const b = {
  id: "a",
  name: "Desire Home Interior",
  city: "Mumbai",
  area: "Bandra",
  address: "A63 Noida up 201306",
  pincode: "201306",
  phone: "9876543210",
  email: "",
  photos: [],
  description: "Interior design",
  hours: "",
  attributes: {},
  updated_at: "2026-11-14",
};
describe("directory quality rules", () => {
  it("flags the reported Noida address versus Mumbai city without rewriting", () => {
    expect(
      qualityIssues(b, [], ["Noida", "Mumbai"]).some((i) => i.kind === "location_conflict"),
    ).toBe(true);
    expect(b.city).toBe("Mumbai");
  });
  it("does not report the old conflict after city confirmation", () =>
    expect(
      qualityIssues({ ...b, city: "Noida" }, [], ["Noida", "Mumbai"]).some(
        (i) => i.kind === "location_conflict",
      ),
    ).toBe(false));
  it("detects the reported public development instruction", () =>
    expect(placeholderContent("I’ll add product and service management to both dashboards")).toBe(
      true,
    ));
  it("allows real service descriptions", () =>
    expect(placeholderContent("Gypsum ceiling installation for residential interiors")).toBe(
      false,
    ));
  it("identifies shared-phone candidates, not an automatic merge", () =>
    expect(duplicateCandidates(b, [{ ...b, id: "hotel", name: "Hotel" }]).map((x) => x.id)).toEqual(
      ["hotel"],
    ));
  it("required category fields reduce completeness without granting verification", () =>
    expect(
      completeness(b, [{ key: "projects", label: "Projects", type: "text", required: true }]),
    ).toBe(57));
  it("rejects malformed import contacts", () =>
    expect(
      importRowSchema.safeParse({
        name: "A business",
        category: "interior",
        city: "Noida",
        area: "Sector 1",
        address: "Noida",
        phone: "123",
        website: "https://example.org",
        source_url: "https://example.org",
      }).success,
    ).toBe(false));
  it("rejects development content in an import", () =>
    expect(
      importRowSchema.safeParse({
        name: "A business",
        category: "interior",
        city: "Noida",
        area: "Sector 1",
        address: "Noida",
        phone: "9876543210",
        website: "https://example.org",
        source_url: "https://example.org",
        description: "TODO: insert description",
      }).success,
    ).toBe(false));
  it("parses quoted commas and newline descriptions", () =>
    expect(parseCsv('name,description\n"Hotel, Noida","Line 1\nLine 2"')).toEqual([
      ["name", "description"],
      ["Hotel, Noida", "Line 1\nLine 2"],
    ]));
  it("rejects incomplete quoted CSV", () => expect(() => parseCsv('name\n"broken')).toThrow());
  it("rejects unsafe slugs", () =>
    expect(categorySchema.safeParse({ slug: "../category" }).success).toBe(false));
});
