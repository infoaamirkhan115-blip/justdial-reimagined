import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { type Business, type City } from "@/data/catalog";
import { photoUrls } from "@/lib/photos";
import { fetchDirectoryDefinitions, mapCategories } from "./managed-directory";

type Row = Tables<"businesses"> & {
  business_offerings?: { name: string; published: boolean }[];
  reviews?: Pick<
    Tables<"reviews">,
    "id" | "name" | "rating" | "text" | "created_at" | "owner_reply"
  >[];
};
export type Service = { name: string; price: string };

export function rowToBusiness(r: Row, urls: Record<string, string> = {}): Business {
  const revs = r.reviews ?? [];
  const rating = revs.length
    ? Math.round((revs.reduce((a, x) => a + x.rating, 0) / revs.length) * 10) / 10
    : 0;
  const gallery = r.photos.map((p) => urls[p]).filter(Boolean) as string[];
  const years = r.year_established ? Math.max(0, new Date().getFullYear() - r.year_established) : 0;
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    attributes: r.attributes as Record<string, unknown>,
    serviceAreas: Array.isArray(r.service_areas) ? (r.service_areas as string[]) : [],
    sub: r.sub,
    city: r.city as City,
    area: r.area,
    rating,
    reviews: revs.length,
    years,
    verified: false,
    trust: false,
    sponsored: false,
    open: null,
    hours: r.hours,
    distance: null,
    phone: r.phone,
    image: gallery[0] ?? "",
    gallery,
    logo: r.logo ? urls[r.logo] : undefined,
    offeringTitles: (r.business_offerings ?? []).filter((o) => o.published).map((o) => o.name),
    tags: r.tags,
    highlight: r.description ? r.description.split(".")[0] + "." : "Newly listed on Justdial.",
    price: r.price,
    services: Array.isArray(r.services) ? (r.services as Service[]).filter((s) => s?.name) : [],
    live: true,
    description: r.description,
    address: r.address,
    website: r.website,
    email: r.email,
    whatsapp: r.whatsapp,
    landmark: r.landmark,
    pincode: r.pincode,
    payments: r.payment_methods,
    days: r.days_open,
    reviewList: revs.map((x) => ({
      id: x.id,
      name: x.name,
      rating: x.rating,
      date: new Date(x.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      text: x.text + (x.owner_reply ? `\n\nOwner reply: ${x.owner_reply}` : ""),
    })),
  };
}

const SELECT =
  "*, reviews(id, name, rating, text, created_at, owner_reply), business_offerings(name,published)";
const allPaths = (rows: Row[], galleryAll: boolean) =>
  rows.flatMap((r) => [...(galleryAll ? r.photos : r.photos.slice(0, 1)), r.logo ?? ""]);

export const liveBusinessesQ = queryOptions({
  queryKey: ["public", "businesses"],
  queryFn: async () => {
    const rows: Row[] = [];
    for (let offset = 0; ; offset += 500) {
      const { data, error } = await supabase
        .from("businesses")
        .select(SELECT)
        .eq("status", "approved")
        .is("archived_at", null)
        .order("id")
        .range(offset, offset + 499);
      if (error) throw new Error("Couldn't load businesses. Please retry.");
      rows.push(...(data as Row[]));
      if (data.length < 500) break;
    }
    const urls = await photoUrls(allPaths(rows, false));
    const definitions = await fetchDirectoryDefinitions();
    const categories = mapCategories(definitions.categories);
    return rows.map((r) => {
      const b = rowToBusiness(r, urls);
      const c = categories.find((c) => c.id === r.category_id || c.slug === r.category);
      return { ...b, categoryName: c?.name, searchAliases: c?.aliases };
    });
  },
  staleTime: 30_000,
});

export const liveBusinessQ = (id: string) =>
  queryOptions({
    queryKey: ["public", "business", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select(SELECT)
        .eq(/^[0-9a-f-]{36}$/.test(id) ? "id" : "public_slug", id)
        .eq("status", "approved")
        .is("archived_at", null)
        .maybeSingle();
      if (error) throw new Error("Couldn't load this business. Please retry.");
      if (!data) return null;
      const urls = await photoUrls(allPaths([data as Row], true));
      return rowToBusiness(data as Row, urls);
    },
  });
