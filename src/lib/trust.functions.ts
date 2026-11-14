import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { staffRoles } from "./trust-rules";

export const trustData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const s = context.supabase;
    const results = await Promise.all([
      s.from("business_claims").select("*"),
      s.from("business_verifications").select("*"),
      s.from("staff_assignments").select("*"),
      s.from("review_reports").select("*,reviews(name,text,rating,business_id)"),
      s.from("directory_audit").select("*").order("created_at", { ascending: false }).limit(300),
      s.from("businesses").select("id,name,verified,owner_id,city,category,plan,sponsored"),
      s.from("profiles").select("id,full_name"),
    ]);
    for (const r of results) if (r.error) throw new Error("Could not load trust records");
    return {
      claims: results[0].data ?? [],
      verifications: results[1].data ?? [],
      staff: results[2].data ?? [],
      reports: results[3].data ?? [],
      audit: results[4].data ?? [],
      businesses: results[5].data ?? [],
      profiles: results[6].data ?? [],
      userId: context.userId,
    };
  });
export const submitClaim = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      business_id: z.string().uuid(),
      identity_name: z.string().trim().min(2).max(150),
      contact: z.string().trim().min(5).max(200),
      corrections: z.string().max(4000),
      evidence: z.array(z.string().max(300)).max(8),
    }),
  )
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("business_claims")
      .insert({ ...data, claimant_id: context.userId })
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const trustAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.discriminatedUnion("action", [
      z.object({
        action: z.literal("claim"),
        id: z.string().uuid(),
        state: z.enum([
          "evidence_requested",
          "under_review",
          "approved",
          "rejected",
          "revoked",
          "expired",
        ]),
        reason: z.string().trim().min(5).max(2000),
        contacts: z.array(z.string().max(200)).max(5),
        expiry: z.string().datetime().nullable(),
      }),
      z.object({
        action: z.literal("verification"),
        business: z.string().uuid(),
        scope: z.string().max(200),
        summary: z.string().max(500),
        evidence: z.string().max(1000),
        reason: z.string().trim().min(5).max(2000),
        expiry: z.string().datetime().nullable(),
        revoke: z.string().uuid().nullable(),
      }),
      z.object({
        action: z.literal("staff"),
        user: z.string().uuid(),
        role: z.enum(staffRoles),
        city: z.string().max(100).nullable(),
        category: z.string().max(100).nullable(),
        remove: z.boolean(),
        reason: z.string().trim().min(5).max(2000),
      }),
      z.object({
        action: z.literal("report"),
        id: z.string().uuid(),
        uphold: z.boolean(),
        reason: z.string().trim().min(5).max(2000),
      }),
      z.object({
        action: z.literal("appeal"),
        id: z.string().uuid(),
        reason: z.string().trim().min(10).max(4000),
      }),
      z.object({
        action: z.literal("evidence"),
        id: z.string().uuid(),
        paths: z.array(z.string().max(300)).max(8),
      }),
    ]),
  )
  .handler(async ({ data: d, context }) => {
    const s = context.supabase;
    const r =
      d.action === "claim"
        ? await s.rpc("decide_claim", {
            claim_id: d.id,
            next_state: d.state,
            decision_reason: d.reason,
            contact_checks: d.contacts,
            ...(d.expiry ? { expiry: d.expiry } : {}),
          })
        : d.action === "verification"
          ? await s.rpc("record_business_verification", {
              bid: d.business,
              checked_scope: d.scope,
              summary: d.summary,
              evidence_ref: d.evidence,
              decision_reason: d.reason,
              ...(d.expiry ? { expiry: d.expiry } : {}),
              ...(d.revoke ? { revoke_id: d.revoke } : {}),
            })
          : d.action === "staff"
            ? await s.rpc("set_staff_assignment", {
                target_user: d.user,
                staff_role: d.role,
                scope_city: d.city ?? "",
                scope_category: d.category ?? "",
                remove_role: d.remove,
                decision_reason: d.reason,
              })
            : d.action === "report"
              ? await s.rpc("decide_review_report", {
                  report_id: d.id,
                  uphold: d.uphold,
                  decision_reason: d.reason,
                })
              : d.action === "appeal"
                ? await s.rpc("appeal_review_report", { report_id: d.id, appeal_text: d.reason })
                : await s.rpc("add_claim_evidence", { claim_id: d.id, paths: d.paths });
    if (r.error) throw new Error(r.error.message);
    return { saved: true };
  });
export const reportReview = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      review_id: z.string().uuid(),
      reason: z.enum([
        "spam",
        "duplicate",
        "harassment",
        "personal_data",
        "conflict_of_interest",
        "other",
      ]),
      evidence: z.string().max(4000),
    }),
  )
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("review_reports")
      .insert({ ...data, reporter_id: context.userId })
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const evidenceLink = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.string().min(1).max(300))
  .handler(async ({ data, context }) => {
    const r = await context.supabase.storage.from("trust-evidence").createSignedUrl(data, 300);
    if (r.error) throw new Error("Evidence access denied");
    return r.data.signedUrl;
  });
