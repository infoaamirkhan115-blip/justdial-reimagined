import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { offeringSchema } from "./offering-schema";

export const saveOffering = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(offeringSchema)
  .handler(async ({ data, context }) => {
    // A business must be owned by the caller, or the caller must be an admin.
    const { data: business, error: readError } = await context.supabase
      .from("businesses")
      .select("id,owner_id")
      .eq("id", data.business_id)
      .single();
    if (readError || !business) throw new Error("Business not available");
    if (business.owner_id !== context.userId) {
      const { data: admin } = await context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      });
      if (!admin) throw new Error("You cannot manage this business");
    }
    const { data: admin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    const { id, ...values } = data;
    const requested = data.review_state ?? (data.published ? "published" : "draft");
    const review_state = !admin && requested === "published" ? "review" : requested;
    const payload = {
      ...values,
      inclusions: values.inclusions ?? "",
      exclusions: values.exclusions ?? "",
      minimum_quantity: values.minimum_quantity ?? null,
      minimum_area: values.minimum_area ?? null,
      review_state,
      published: review_state === "published",
    };
    const result = id
      ? await context.supabase
          .from("business_offerings")
          .update(payload)
          .eq("id", id)
          .eq("business_id", business.id)
          .select("id")
          .single()
      : await context.supabase.from("business_offerings").insert(payload).select("id").single();
    if (result.error) throw new Error("Could not save this item");
    return result.data;
  });
export const deleteOffering = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).strict())
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("business_offerings")
      .delete()
      .eq("id", data.id)
      .select("id");
    if (error || !rows?.length) throw new Error("Could not delete this item");
    return { deleted: true };
  });
