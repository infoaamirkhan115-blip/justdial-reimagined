import { describe, it, expect } from "vitest";
import { permits, claimTransition } from "./trust-rules";
describe("Phase 4 trust rules", () => {
  it("submission cannot directly approve ownership", () =>
    expect(claimTransition("submitted", "approved")).toBe(false));
  it("review permits an explicit approval", () =>
    expect(claimTransition("under_review", "approved")).toBe(true));
  it("an approved claim can be revoked", () =>
    expect(claimTransition("approved", "revoked")).toBe(true));
  it("sales cannot grant verification", () =>
    expect(permits("sales", "verification.review")).toBe(false));
  it("finance cannot assign staff", () => expect(permits("finance", "staff.manage")).toBe(false));
  it("support cannot moderate reviews", () =>
    expect(permits("support", "reviews.moderate")).toBe(false));
  it("moderators cannot escalate roles", () =>
    expect(permits("listing_moderator", "staff.manage")).toBe(false));
  it("super admin can provision staff", () =>
    expect(permits("super_admin", "staff.manage")).toBe(true));
});
