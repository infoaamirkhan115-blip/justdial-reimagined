import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  categorySchema,
  categoryFieldSchema,
  duplicateCandidates,
  importRowSchema,
  qualityIssues,
} from "./directory-quality";

export const managementData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin, error } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (error || !admin) throw new Error("Administrator access required");
    const results = await Promise.all([
      context.supabase.from("directory_categories").select("*").order("position"),
      context.supabase.from("directory_locations").select("*").order("name"),
      context.supabase
        .from("directory_quality_issues")
        .select("*")
        .order("created_at", { ascending: false }),
      context.supabase
        .from("directory_audit")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500),
      context.supabase.from("listing_change_requests").select("*"),
      context.supabase
        .from("directory_import_batches")
        .select("*")
        .order("created_at", { ascending: false }),
      context.supabase.from("profiles").select("id,full_name"),
      context.supabase.from("businesses").select("*"),
      context.supabase.from("directory_staff_notes").select("*"),
      context.supabase.from("business_organizations").select("*"),
    ]);
    for (const r of results) if (r.error) throw new Error(r.error.message);
    return {
      categories: results[0].data ?? [],
      locations: results[1].data ?? [],
      issues: results[2].data ?? [],
      audit: results[3].data ?? [],
      changes: results[4].data ?? [],
      imports: results[5].data ?? [],
      profiles: results[6].data ?? [],
      businesses: results[7].data ?? [],
      notes: results[8].data ?? [],
      organizations: results[9].data ?? [],
    };
  });
export const saveCategory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(categorySchema)
  .handler(async ({ data, context }) => {
    const { id, ...payload } = data;
    const r = id
      ? await context.supabase
          .from("directory_categories")
          .update(payload)
          .eq("id", id)
          .select("id")
          .single()
      : await context.supabase.from("directory_categories").insert(payload).select("id").single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const saveLocation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      parent_id: z.string().uuid().nullable(),
      kind: z.enum(["city", "locality", "pincode"]),
      name: z.string().trim().min(1).max(100),
      active: z.boolean(),
      source_url: z.union([z.literal(""), z.string().url()]),
      verified: z.boolean(),
    }),
  )
  .handler(async ({ data, context }) => {
    if (data.verified && !data.source_url) throw new Error("Verified locations require a source");
    if (data.kind === "pincode" && !/^[1-9]\d{5}$/.test(data.name))
      throw new Error("Pincode must have six digits");
    const { id, ...p } = data;
    const r = id
      ? await context.supabase
          .from("directory_locations")
          .update(p)
          .eq("id", id)
          .select("id")
          .single()
      : await context.supabase.from("directory_locations").insert(p).select("id").single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const refreshQuality = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Administrator access required");
    const [bs, cs, ls, os, notes, previous] = await Promise.all([
      context.supabase.from("businesses").select("*"),
      context.supabase.from("directory_categories").select("*"),
      context.supabase.from("directory_locations").select("*"),
      context.supabase.from("business_offerings").select("*"),
      context.supabase.from("directory_staff_notes").select("*"),
      context.supabase.from("directory_quality_issues").select("fingerprint"),
    ]);
    for (const r of [bs, cs, ls, os, notes, previous])
      if (r.error) throw new Error(r.error.message);
    const known = new Set(previous.data?.map((i) => i.fingerprint));
    let count = 0;
    for (const b of bs.data ?? []) {
      if (b.archived_at) continue;
      const c = cs.data?.find((c) => c.id === b.category_id);
      const parsed = z.array(categoryFieldSchema).safeParse(c?.fields ?? []);
      const issues = qualityIssues(
        b,
        parsed.success ? parsed.data : [],
        ls.data?.filter((l) => l.kind === "city").map((l) => l.name),
      );
      if (b.structured_hours && Array.isArray(b.structured_hours) && b.structured_hours.length) {
        const index = issues.findIndex((i) => i.kind === "unstructured_hours");
        if (index >= 0) issues.splice(index, 1);
      }
      if (notes.data?.find((n) => n.business_id === b.id)?.ownership_status !== "confirmed")
        issues.push({
          kind: "unverified_ownership",
          severity: "medium",
          fields: ["ownership"],
          summary: "Confirm ownership independently; completeness is not verification.",
        });
      const duplicates = duplicateCandidates(b, bs.data ?? []);
      if (duplicates.length)
        issues.push({
          kind: "possible_duplicate",
          severity: "medium",
          fields: ["name", "phone"],
          summary: `Review candidates: ${duplicates.map((d) => d.name).join(", ")}. A shared phone does not establish duplication.`,
        });
      for (const l of ls.data ?? [])
        if (
          (l.id === b.locality_id && l.parent_id !== b.city_id) ||
          (l.id === b.pincode_id && (!l.parent_id || l.parent_id !== b.city_id))
        )
          issues.push({
            kind: "location_relationship",
            severity: "medium",
            fields: ["city_id", "locality_id", "pincode_id"],
            summary:
              "Managed locality/pincode relationship is conflicting or unconfirmed. Review source evidence.",
          });
      for (const issue of issues) {
        const fingerprint = `${b.id}:${issue.kind}`;
        if (known.has(fingerprint)) continue;
        const r = await context.supabase
          .from("directory_quality_issues")
          .insert({ ...issue, business_id: b.id, fingerprint });
        if (r.error) throw new Error(r.error.message);
        known.add(fingerprint);
        count++;
      }
    }
    for (const o of os.data ?? [])
      if (
        /lorem ipsum|placeholder|both dashboards|I[’']ll add product|TODO:/i.test(o.description)
      ) {
        const fingerprint = `${o.id}:placeholder`;
        if (!known.has(fingerprint)) {
          const r = await context.supabase.from("directory_quality_issues").insert({
            business_id: o.business_id,
            offering_id: o.id,
            fingerprint,
            kind: "placeholder",
            severity: "high",
            fields: ["description"],
            summary: "Catalogue description contains development text; correct before publication.",
          });
          if (r.error) throw new Error(r.error.message);
          count++;
        }
      }
    return { added: count };
  });
export const updateQualityIssue = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      status: z.enum(["open", "in_progress", "resolved", "dismissed"]),
      notes: z.string().max(4000),
      assignee: z.string().uuid().nullable(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { id, ...p } = data;
    const r = await context.supabase
      .from("directory_quality_issues")
      .update(p)
      .eq("id", id)
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const archiveBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), restore: z.boolean() }))
  .handler(async ({ data, context }) => {
    const b = await context.supabase
      .from("businesses")
      .select("status,archive_status")
      .eq("id", data.id)
      .single();
    if (b.error) throw new Error("Listing unavailable");
    const r = await context.supabase
      .from("businesses")
      .update(
        data.restore
          ? { archived_at: null, status: b.data.archive_status ?? "pending" }
          : {
              archive_status: b.data.status,
              archived_at: new Date().toISOString(),
              status: "archived",
            },
      )
      .eq("id", data.id)
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const reviewChange = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      approve: z.boolean(),
      feedback: z.string().min(3).max(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("review_listing_change", {
      request_id: data.id,
      approve: data.approve,
      feedback_text: data.feedback,
    });
    if (r.error) throw new Error(r.error.message);
    return { saved: true };
  });
export const mergeBusinesses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      source: z.string().uuid(),
      target: z.string().uuid(),
      reason: z.string().min(5).max(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    const r = await context.supabase.rpc("merge_directory_businesses", {
      source_id: data.source,
      target_id: data.target,
      reason: data.reason,
    });
    if (r.error) throw new Error(r.error.message);
    return { merged: true };
  });
export const stageImport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      filename: z.string().max(200),
      mapping: z.record(z.string(), z.string()),
      rows: z.array(z.record(z.string(), z.string())).min(1).max(500),
    }),
  )
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("directory_import_batches")
      .insert({ ...data, created_by: context.userId })
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const saveStaffNote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      business_id: z.string().uuid(),
      note: z.string().max(5000),
      ownership_status: z.enum(["unverified", "review", "confirmed"]),
      ownership_evidence: z.string().max(2000),
    }),
  )
  .handler(async ({ data, context }) => {
    if (data.ownership_status === "confirmed" && !data.ownership_evidence.trim())
      throw new Error("Ownership confirmation requires evidence");
    const r = await context.supabase
      .from("directory_staff_notes")
      .upsert(data)
      .select("business_id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
export const importAction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), reverse: z.boolean() }))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!admin) throw new Error("Administrator access required");
    const batch = await context.supabase
      .from("directory_import_batches")
      .select("*")
      .eq("id", data.id)
      .single();
    if (batch.error) throw new Error("Batch unavailable");
    if (!data.reverse) {
      const rows = z.array(importRowSchema).parse(batch.data.rows);
      const categories = await context.supabase
        .from("directory_categories")
        .select("slug,legacy_slug,active");
      const locations = await context.supabase
        .from("directory_locations")
        .select("name,kind,active");
      for (const row of rows) {
        if (
          !categories.data?.some(
            (c) => c.active && (c.slug === row.category || c.legacy_slug === row.category),
          )
        )
          throw new Error(`Unknown category: ${row.category}`);
        if (!locations.data?.some((l) => l.active && l.kind === "city" && l.name === row.city))
          throw new Error(`Unknown city: ${row.city}`);
        if (
          qualityIssues(
            {
              ...row,
              id: "import",
              email: "",
              photos: [],
              hours: "",
              attributes: {},
              updated_at: new Date().toISOString(),
            },
            [],
            locations.data?.filter((l) => l.kind === "city").map((l) => l.name),
          ).some((i) => i.kind === "location_conflict")
        )
          throw new Error("Conflicting location cannot be published");
      }
    }
    const r = await context.supabase.rpc("apply_directory_import", {
      batch_id: data.id,
      reverse_batch: data.reverse,
    });
    if (r.error) throw new Error(r.error.message);
    return { saved: true };
  });
