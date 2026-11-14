export const staffRoles = ["customer", "business_owner", "listing_moderator", "support", "sales", "content_manager", "finance", "super_admin"] as const;
export type StaffRole = (typeof staffRoles)[number];
export const permissionMatrix: Record<StaffRole, readonly string[]> = {
  customer: [], business_owner: [],
  listing_moderator: ["claims.review", "verification.review", "reviews.moderate", "listings.moderate", "audit.read"],
  support: ["claims.read", "reviews.read"], sales: ["listings.read"],
  content_manager: ["listings.read", "catalogue.read"], finance: ["entitlements.read", "audit.read"],
  super_admin: ["*"],
};
export function permits(role: StaffRole, permission: string) { return permissionMatrix[role].includes("*") || permissionMatrix[role].includes(permission); }
export function claimTransition(from: string, to: string) {
  const transitions: Record<string, string[]> = { submitted: ["evidence_requested", "under_review", "rejected"], evidence_requested: ["under_review", "rejected"], under_review: ["approved", "rejected", "evidence_requested"], approved: ["revoked", "expired"] };
  return transitions[from]?.includes(to) ?? false;
}