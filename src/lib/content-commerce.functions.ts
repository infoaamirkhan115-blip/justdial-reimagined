import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database, Json } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { contentSchema, safeContentLink } from "./content-commerce-rules";

function publicClient() {
  const url = process.env["SUPABASE_URL"], key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) throw new Error("Directory content is unavailable");
  return createClient<Database>(url, key, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (input, init) => {
    const headers = new Headers(init?.headers);
    if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
    headers.set("apikey", key); return fetch(input, { ...init, headers });
  } } });
}
export const publicContent = createServerFn({ method: "GET" }).handler(async () => {
  const s = publicClient();
  const rows = [];
  for (let offset = 0; ; offset += 500) {
    const r = await s.from("site_content").select("key,kind,published,published_at").not("published", "is", null).order("id").range(offset, offset + 499);
    if (r.error) throw new Error("Could not load site content");
    rows.push(...r.data); if (r.data.length < 500) break;
  }
  return rows.map(r => ({ key: r.key, kind: r.kind, payload: contentSchema.parse(r.published), updated_at: r.published_at }));
});
export const contentAdmin = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const allowed = await context.supabase.rpc("has_permission", { permission: "content.manage" });
  if (allowed.error || !allowed.data) throw new Error("Content management denied");
  const [content, history] = await Promise.all([
    context.supabase.from("site_content").select("*").order("updated_at", { ascending: false }),
    context.supabase.from("content_revisions").select("*").order("created_at", { ascending: false }).limit(300),
  ]);
  if (content.error || history.error) throw new Error("Could not load content history");
  return { content: content.data, history: history.data };
});
export const saveContent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ payload: contentSchema, publish: z.boolean(), reason: z.string().trim().min(5).max(1000) }))
  .handler(async ({ context, data }) => {
    if (!safeContentLink(data.payload.href) || (data.payload.image && !/^https:\/\//.test(data.payload.image))) throw new Error("Use a safe link and HTTPS image");
    const r = await context.supabase.rpc("save_site_content", { payload: data.payload, publish_content: data.publish, decision_reason: data.reason });
    if (r.error) throw new Error(r.error.message); return r.data;
  });
export const unpublishContent = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), reason: z.string().trim().min(5).max(1000) }))
  .handler(async ({ context, data }) => { const r = await context.supabase.rpc("unpublish_site_content", { cid: data.id, decision_reason: data.reason }); if (r.error) throw new Error(r.error.message); return true; });
export const commerceData = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const s = context.supabase;
  const [plans, subscriptions, invoices, placements, offers, redemptions, events, businesses] = await Promise.all([
    s.from("plan_definitions").select("*"), s.from("business_subscriptions").select("*").order("created_at", { ascending: false }),
    s.from("commercial_records").select("*"), s.from("sponsored_placements").select("*"), s.from("merchant_offers").select("*"),
    s.from("offer_redemptions").select("*"), s.from("placement_events").select("*"), s.from("businesses").select("id,name,city,category,owner_id,status"),
  ]);
  for (const r of [plans,subscriptions,invoices,placements,offers,redemptions,events,businesses]) if(r.error) throw new Error("Could not load commercial records");
  return { plans: plans.data ?? [], subscriptions: subscriptions.data ?? [], invoices: invoices.data ?? [], placements: placements.data ?? [], offers: offers.data ?? [], redemptions: redemptions.data ?? [], events: events.data ?? [], businesses: businesses.data ?? [], userId: context.userId, provider: "setup_required" as const };
});
const date = z.string().datetime();
const commercePayload = z.discriminatedUnion("kind", [
  z.object({kind:z.literal("plan"),key:z.enum(["free","premium","platinum"]),name:z.string().min(2).max(100),price_minor:z.number().int().min(0).max(100000000),period_days:z.number().int().min(1).max(366),entitlements:z.object({max_offerings:z.number().int().min(0).max(10000),max_photos:z.number().int().min(0).max(10)}),active:z.boolean()}),
  z.object({kind:z.literal("subscription"),business_id:z.string().uuid(),plan_id:z.string().uuid(),starts_at:date,ends_at:date}),
  z.object({kind:z.literal("cancel"),id:z.string().uuid(),immediate:z.boolean()}),
  z.object({kind:z.literal("invoice"),subscription_id:z.string().uuid(),reference:z.string().min(3).max(100),amount_minor:z.number().int().min(0).max(100000000),status:z.enum(["unpaid","paid","failed","void"]),external_reference:z.string().max(200)}),
  z.object({kind:z.literal("placement"),business_id:z.string().uuid(),city:z.string().min(2).max(100),category:z.string().max(100),placement:z.enum(["search","home","category"]),starts_at:date,ends_at:date,status:z.enum(["active","paused","expired"]),creative:z.string().min(2).max(1000),approved:z.boolean(),terms:z.string().min(5).max(4000),budget_minor:z.number().int().min(0).max(100000000)}),
  z.object({kind:z.literal("placement_status"),id:z.string().uuid(),status:z.enum(["active","paused","expired"])}),
  z.object({kind:z.literal("offer"),business_id:z.string().uuid(),city:z.string().min(2).max(100),locality:z.string().max(100),title:z.string().min(2).max(200),eligibility:z.string().min(2).max(2000),terms:z.string().min(5).max(4000),starts_at:date,ends_at:date,usage_limit:z.number().int().min(0).max(100000),approved:z.boolean(),status:z.enum(["draft","active","paused","expired"])}),
  z.object({kind:z.literal("offer_status"),id:z.string().uuid(),status:z.enum(["draft","active","paused","expired"])}),
  z.object({kind:z.literal("redeem"),offer_id:z.string().uuid(),reference:z.string().uuid()}),
]);
export const commercialAction = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .inputValidator(z.object({ payload: commercePayload, reason:z.string().trim().min(5).max(2000) }))
  .handler(async ({ data, context }) => {
    const p = data.payload;
    if ("starts_at" in p && Date.parse(p.ends_at)<=Date.parse(p.starts_at)) throw new Error("End date must follow start date");
    const r = await context.supabase.rpc("commerce_action", { kind:p.kind,payload:p as Json,decision_reason:data.reason });
    if(r.error) throw new Error(r.error.message); return r.data;
  });
export const publicCommercial = createServerFn({ method: "GET" }).inputValidator(z.object({city:z.string().max(100),category:z.string().max(100).default(""),placement:z.enum(["search","home","category"]).default("search")})).handler(async ({ data }) => {
  const s=publicClient();
  const [placements,offers,plans]=await Promise.all([s.rpc("public_placements",{selected_city:data.city,selected_category:data.category,selected_placement:data.placement}),s.from("merchant_offers").select("id,business_id,title,eligibility,terms,city,locality,starts_at,ends_at,usage_limit,redemption_mode").eq("city",data.city).eq("status","active").eq("approved",true).lte("starts_at",new Date().toISOString()).gt("ends_at",new Date().toISOString()),s.from("plan_definitions").select("*").eq("active",true)]);
  if(placements.error||offers.error||plans.error) throw new Error("Commercial content is unavailable");
  return {placements:placements.data,offers:offers.data,plans:plans.data};
});