import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const allBusinessesQ = queryOptions({
  queryKey: ["admin", "businesses"],
  queryFn: async () => { const { data, error } = await supabase.from("businesses").select("*").order("created_at", { ascending: false }); if (error) throw error; return data; },
});
export const allLeadsQ = queryOptions({
  queryKey: ["admin", "leads"],
  queryFn: async () => { const { data, error } = await supabase.from("leads").select("*, businesses(name)").order("created_at", { ascending: false }); if (error) throw error; return data; },
});
export const allReviewsQ = queryOptions({
  queryKey: ["admin", "reviews"],
  queryFn: async () => { const { data, error } = await supabase.from("reviews").select("*, businesses(name)").order("created_at", { ascending: false }); if (error) throw error; return data; },
});
export const allUsersQ = queryOptions({
  queryKey: ["admin", "users"],
  queryFn: async () => {
    const [p, r, b] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("businesses").select("owner_id"),
    ]);
    if (p.error) throw p.error; if (r.error) throw r.error; if (b.error) throw b.error;
    return p.data.map((u) => ({ ...u, roles: r.data.filter((x) => x.user_id === u.id).map((x) => x.role), listings: b.data.filter((x) => x.owner_id === u.id).length }));
  },
});
