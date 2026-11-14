import { it, expect, vi } from "vitest";
import { saveListingDraft, readListingDraft, clearListingDraft } from "./listing-draft";
it("restores onboarding details and clears on explicit discard", () => {
  saveListingDraft({
    name: "Owner draft",
    phone: "9876543210",
    city: "Noida",
    category: "restaurants",
  });
  expect(readListingDraft()?.name).toBe("Owner draft");
  clearListingDraft();
  expect(readListingDraft()).toBeNull();
});
it("expires retained drafts after seven days", () => {
  vi.useFakeTimers();
  saveListingDraft({ name: "Draft", phone: "9876543210", city: "Noida", category: "restaurants" });
  vi.advanceTimersByTime(7 * 86400000 + 1);
  expect(readListingDraft()).toBeNull();
  vi.useRealTimers();
});
