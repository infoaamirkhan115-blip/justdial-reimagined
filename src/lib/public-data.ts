import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { categoryImage, type Business, type City } from "@/data/catalog";

type Row = Tables<"businesses"> & { reviews?: Pick<Tables<"reviews">, "name" | "rating" | "text" | "created_at" | "owner_reply">[] };

export function rowToBusiness(r: Row): Business {
  const revs = r.reviews ?? [];
  const rating = revs.length ? Math.round((revs.reduce((a, x) => a + x.rating, 0) / revs.length) * 10) / 10 : 0;
  return {
    id: r.id, name: r.name, category: r.category, sub: r.sub || "General", city: r.city as City, area: r.area,
    rating, reviews: revs.length, years: Math.max(1, new Date().getFullYear() - new Date(r.created_at).getFullYear()),
    verified: r.verified, trust: r.plan !== "free", sponsored: r.sponsored, open: true, hours: r.hours,
    distance: 1.2, phone: r.phone ? `+91 ${r.phone}` : "", image: categoryImage(r.category), tags: r.tags,
    highlight: r.description ? r.description.split(".")[0] + "." : "Newly listed on Justdial.", price: r.price,
    services: [], live: true, description: r.description, address: r.address,
    reviewList: revs.map((x) => ({ name: x.name, rating: x.rating, date: new Date(x.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), text: x.text + (x.owner_reply ? `\n\nOwner reply: ${x.owner_reply}` : "") })),
  };
}

const SELECT = "*, reviews(name, rating, text, created_at, owner_reply)";

export const liveBusinessesQ = queryOptions({
  queryKey: ["public", "businesses"],
  queryFn: async () => {
    const { data, error } = await supabase.from("businesses").select(SELECT).eq("status", "approved").order("sponsored", { ascending: false });
    if (error) return [] as Business[];
    return (data as Row[]).map(rowToBusiness);
  },
  staleTime: 30_000,
});

export const liveBusinessQ = (id: string) => queryOptions({
  queryKey: ["public", "business", id],
  queryFn: async () => {
    const { data } = await supabase.from("businesses").select(SELECT).eq("id", id).maybeSingle();
    return data ? rowToBusiness(data as Row) : null;
  },
});
