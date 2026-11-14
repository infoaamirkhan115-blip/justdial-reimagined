import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BadgeCheck } from "lucide-react";
export function VerificationBadges({id}:{id:string}){
  const {data}=useQuery({queryKey:["verification-public",id],queryFn:async()=>{const r=await supabase.rpc("public_verification",{bid:id});if(r.error)throw r.error;return r.data;}});
  return <>{data?.map((v,i)=><span key={i} title={`${v.summary} · Checked ${new Date(v.checked_at).toLocaleDateString()}${v.expires_at?` · Valid until ${new Date(v.expires_at).toLocaleDateString()}`:""}`} className="inline-flex items-center gap-1 rounded-lg bg-success-soft px-2 py-1 text-xs font-bold text-success"><BadgeCheck className="size-4"/>{v.scope} checked</span>)}</>;
}