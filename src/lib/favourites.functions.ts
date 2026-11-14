import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
export const getFavourite = createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>z.object({businessId:z.string().uuid()}).parse(input)).handler(async({data,context})=>{
 const {data:row,error}=await context.supabase.from("favourites").select("business_id").eq("user_id",context.userId).eq("business_id",data.businessId).maybeSingle(); if(error)throw new Error("Could not load saved business");return Boolean(row);
});
export const setFavourite = createServerFn({method:"POST"}).middleware([requireSupabaseAuth]).inputValidator((input:unknown)=>z.object({businessId:z.string().uuid(),saved:z.boolean()}).parse(input)).handler(async({data,context})=>{
 const result=data.saved?await context.supabase.from("favourites").upsert({user_id:context.userId,business_id:data.businessId},{onConflict:"user_id,business_id"}):await context.supabase.from("favourites").delete().eq("user_id",context.userId).eq("business_id",data.businessId);
 if(result.error)throw new Error("Could not save your change");return data.saved;
});