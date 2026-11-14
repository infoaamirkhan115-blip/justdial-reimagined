import { describe, expect, it } from "vitest";
import { oauthReturnPath } from "./oauth-return-path";

describe("OAuth return destinations", () => {
  it("preserves the consent authorization and fragment", () => {
    expect(oauthReturnPath("/.lovable/oauth/consent?authorization_id=abc#decision")).toBe("/.lovable/oauth/consent?authorization_id=abc#decision");
  });
  it("rejects external, network, backslash and control-character destinations", () => {
    for (const value of ["https://outside.invalid", "//outside.invalid", "/\\outside.invalid/", "/auth\n", null]) {
      expect(oauthReturnPath(value)).toBe("/");
    }
  });
});