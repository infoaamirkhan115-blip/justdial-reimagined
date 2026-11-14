import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { publicCommercial } from "@/lib/content-commerce.functions";
import { liveBusinessesQ } from "@/lib/public-data";
import { BusinessCard } from "./ui";
import { supabase } from "@/integrations/supabase/client";
export function SponsoredResults({city,category="",placement="search",allowedIds}:{city:string;category?:string;placement?:"home"|"search"|"category";allowedIds?:string[]}) {
  const q=useQuery({queryKey:["placements",city,category,placement],queryFn:()=>publicCommercial({data:{city,category,placement}}),staleTime:0,refetchInterval:30000}), businesses=useQuery(liveBusinessesQ);
  const visible=q.data?.placements.filter(p=>!allowedIds||allowedIds.includes(p.business_id))??[];
  useEffect(()=>{for(const p of visible)void supabase.rpc("record_placement_event",{pid:p.id,ek:crypto.randomUUID(),event_kind:"impression"});},[visible.map(p=>p.id).join(",")]);
  return <>{visible.map(p=>{const b=businesses.data?.find(b=>b.id===p.business_id&&b.city===city);return b?<div key={p.id} className="mb-4" onClickCapture={()=>void supabase.rpc("record_placement_event",{pid:p.id,ek:crypto.randomUUID(),event_kind:"click"})}><p className="mb-2 text-xs font-bold text-coral">Sponsored · {p.creative}</p><BusinessCard b={{...b,sponsored:true}}/></div>:null;})}</>;
}