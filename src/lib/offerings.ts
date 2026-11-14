import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { photoUrls } from "./photos";
import type { Tables } from "@/integrations/supabase/types";
import { emptyDetails, emptyPricing, type OfferingInput } from "./offering-schema";

export function offeringInput(row: Tables<"business_offerings">): OfferingInput {
  return {
    ...row,
    review_state:
      row.review_state === "published"
        ? "published"
        : row.review_state === "review"
          ? "review"
          : "draft",
    kind: row.kind === "product" ? "product" : "service",
    pricing: { ...emptyPricing, ...(row.pricing as object) },
    product_details: { ...emptyDetails, ...(row.product_details as object) },
    specifications: row.specifications as OfferingInput["specifications"],
  };
}
export const offeringsQ = (businessId?: string, ownerId?: string) =>
  queryOptions({
    queryKey: ["offerings", businessId ?? "all", ownerId ?? "public"],
    queryFn: async () => {
      let query = supabase
        .from("business_offerings")
        .select("*, businesses!inner(name,owner_id,status)")
        .order("created_at", { ascending: false });
      if (businessId)
        query = query
          .eq("business_id", businessId)
          .eq("published", true)
          .eq("businesses.status", "approved");
      if (ownerId) query = query.eq("businesses.owner_id", ownerId);
      const { data, error } = await query;
      if (error) throw error;
      const urls = await photoUrls((data ?? []).flatMap((r) => r.photos));
      return (data ?? []).map((r) => ({
        ...offeringInput(r),
        business_name: r.businesses.name,
        images: r.photos.map((p) => urls[p]).filter((u): u is string => Boolean(u)),
      }));
    },
  });
