import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { isBusinessPhone } from "./business-phone";
import { categoryFieldSchema } from "./directory-quality";
const safePath = z
  .string()
  .regex(/^[0-9a-f-]{36}\/[a-zA-Z0-9][a-zA-Z0-9._-]*\.(jpg|jpeg|png|webp)$/i);
const payloadSchema = z
  .object({
    name: z.string().trim().min(2).max(120),
    category: z.string().min(1),
    sub: z.string().max(120),
    city: z.string().min(1),
    area: z.string().min(1).max(120),
    address: z.string().max(500),
    landmark: z.string().max(200),
    pincode: z.string().regex(/^$|^[1-9]\d{5}$/),
    phone: z.string().refine(isBusinessPhone),
    whatsapp: z.string().regex(/^$|^[6-9]\d{9}$/),
    email: z.union([z.literal(""), z.string().email()]),
    website: z.union([z.literal(""), z.string().url()]),
    price: z.string().max(200),
    hours: z.string().max(500),
    description: z.string().max(10000),
    year_established: z.number().int().min(1800).max(2100).nullable(),
    tags: z.array(z.string()).max(8),
    days_open: z.array(z.string()).max(7),
    payment_methods: z.array(z.string()).max(20),
    photos: z.array(safePath).max(10),
    logo: safePath.nullable(),
    services: z.array(z.object({ name: z.string().max(120), price: z.string().max(120) })).max(30),
    attributes: z.record(z.string(), z.union([z.string().max(2000), z.number(), z.boolean()])),
    service_areas: z.array(z.string().max(200)).max(100),
    organization_id: z.string().uuid().nullable(),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90).nullable(),
      longitude: z.number().min(-180).max(180).nullable(),
      source: z.string().max(500),
      status: z.enum(["unverified", "verified"]),
      checked_at: z.string().max(50),
    }),
    structured_hours: z
      .array(
        z.object({
          day: z.string(),
          opens: z.string().regex(/^\d{2}:\d{2}$/),
          closes: z.string().regex(/^\d{2}:\d{2}$/),
        }),
      )
      .max(7),
  })
  .strict();
export const saveManagedBusiness = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      ownerId: z.string().uuid(),
      payload: payloadSchema,
    }),
  )
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (data.ownerId !== context.userId && !admin)
      throw new Error("You cannot edit another owner’s listing");
    if (data.id) {
      const b = await context.supabase
        .from("businesses")
        .select("owner_id")
        .eq("id", data.id)
        .single();
      if (b.error || (!admin && b.data.owner_id !== context.userId))
        throw new Error("Listing unavailable");
    }
    const cats = await context.supabase.from("directory_categories").select("*");
    if (cats.error) throw new Error(cats.error.message);
    const c = cats.data.find(
      (c) => c.slug === data.payload.category || c.legacy_slug === data.payload.category,
    );
    if (!c) throw new Error("Choose an active category");
    const fields = z.array(categoryFieldSchema).parse(c.fields);
    for (const f of fields) {
      const v = data.payload.attributes[f.key];
      if (v !== undefined && v !== "") {
        if (f.type === "number" && !Number.isFinite(Number(v)))
          throw new Error(`${f.label} must be a number`);
        if (f.type === "url" && !z.string().url().safeParse(v).success)
          throw new Error(`${f.label} requires a valid URL`);
        if (f.type === "select" && !f.options?.includes(String(v)))
          throw new Error(`${f.label} requires an allowed choice`);
      }
    }
    const ls = await context.supabase.from("directory_locations").select("*");
    if (ls.error) throw new Error(ls.error.message);
    const city = ls.data.find((l) => l.kind === "city" && l.name === data.payload.city);
    if (!city) throw new Error("Choose a managed city");
    if (
      data.payload.coordinates.status === "verified" &&
      (!admin ||
        !data.payload.coordinates.source ||
        data.payload.coordinates.latitude === null ||
        data.payload.coordinates.longitude === null)
    )
      throw new Error("Only administrators can verify coordinates with source evidence");
    if (data.payload.organization_id) {
      const o = await context.supabase
        .from("business_organizations")
        .select("id")
        .eq("id", data.payload.organization_id)
        .single();
      if (o.error) throw new Error("Organization unavailable");
    }
    const payload = {
      ...data.payload,
      category_id: c.id,
      category: c.legacy_slug || c.slug,
      city_id: city.id,
      locality_id:
        ls.data.find(
          (l) => l.kind === "locality" && l.name === data.payload.area && l.parent_id === city.id,
        )?.id ?? null,
      pincode_id:
        ls.data.find((l) => l.kind === "pincode" && l.name === data.payload.pincode)?.id ?? null,
    };
    const r = data.id
      ? await context.supabase
          .from("businesses")
          .update(payload)
          .eq("id", data.id)
          .select("id")
          .single()
      : await context.supabase
          .from("businesses")
          .insert({ ...payload, owner_id: data.ownerId })
          .select("id")
          .single();
    if (r.error) throw new Error(r.error.message);
    return { ...r.data, review: !admin && Boolean(data.id) };
  });
export const createOrganization = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().trim().min(2).max(120), ownerId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const r = await context.supabase
      .from("business_organizations")
      .insert({ name: data.name, owner_id: data.ownerId })
      .select("id")
      .single();
    if (r.error) throw new Error(r.error.message);
    return r.data;
  });
