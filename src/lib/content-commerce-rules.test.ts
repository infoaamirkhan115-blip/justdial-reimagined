import { describe, it, expect } from "vitest";
import { periodActive, sectionLabelValid, safeContentLink, indexableLocation } from "./content-commerce-rules";
describe("Phase 6 content and commercial rules", () => {
  it("rejects a label that contradicts category criteria", () => expect(sectionLabelValid("Hospitals in Noida", "Noida", "restaurants")).toBe(false));
  it("rejects a label that contradicts city criteria", () => expect(sectionLabelValid("Restaurants in Mumbai", "Noida", "restaurants")).toBe(false));
  it("expired subscriptions and placements lose privileges at the end instant", () => expect(periodActive("active", "2026-11-01T00:00:00Z", "2026-11-14T10:00:00Z", Date.parse("2026-11-14T10:00:00Z"))).toBe(false));
  it("paused placements have no active privileges", () => expect(periodActive("paused", "2026-11-01T00:00:00Z", "2026-12-01T00:00:00Z", Date.parse("2026-11-14T10:00:00Z"))).toBe(false));
  it("blocks executable content links", () => expect(safeContentLink("javascript:alert(1)")).toBe(false));
  it("keeps thin location pages unindexable", () => expect(indexableLocation("Useful local information".repeat(20), 2)).toBe(false));
});