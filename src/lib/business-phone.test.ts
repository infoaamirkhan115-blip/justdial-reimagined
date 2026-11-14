import { expect, it } from "vitest";
import { isBusinessPhone } from "./business-phone";
it("accepts Noida business landlines and Indian mobiles without truncation", () => {
  expect(isBusinessPhone("01202444444")).toBe(true);
  expect(isBusinessPhone("9599483601")).toBe(true);
  expect(isBusinessPhone("0120244444")).toBe(false);
});