import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const myBusinessesQ = (uid: string) => queryOptions({
  queryKey: ["my-businesses", uid],
  queryFn: async () => {
    const { data, error } = await supabase.from("businesses").select("*").eq("owner_id", uid).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
export const myLeadsQ = (uid: string) => queryOptions({
  queryKey: ["my-leads", uid],
  queryFn: async () => {
    const { data, error } = await supabase.from("leads").select("*, businesses!inner(name, owner_id)").eq("businesses.owner_id", uid).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
export const myReviewsQ = (uid: string) => queryOptions({
  queryKey: ["my-reviews", uid],
  queryFn: async () => {
    const { data, error } = await supabase.from("reviews").select("*, businesses!inner(name, owner_id)").eq("businesses.owner_id", uid).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
});
