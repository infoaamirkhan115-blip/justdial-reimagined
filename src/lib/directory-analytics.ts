import {supabase} from '@/integrations/supabase/client';
import {safeAttribution,safeSearchTerm} from './operations-rules';
type Event='search'|'zero_result_search'|'result_click'|'business_view'|'offering_view'|'call_click'|'whatsapp_click';
export function trackDirectory(event:Event,details:{business_id?:string;offering_id?:string;city?:string;category?:string;term?:string}={}){
 if(typeof window==='undefined'||navigator.doNotTrack==='1'||(navigator as Navigator & {globalPrivacyControl?:boolean}).globalPrivacyControl)return;
 const q=new URLSearchParams(window.location.search);
 void supabase.rpc('record_directory_event',{payload:{...details,term:safeSearchTerm(details.term??''),event,dedupe_key:crypto.randomUUID(),source:safeAttribution(q.get('utm_source')),medium:safeAttribution(q.get('utm_medium')),campaign:safeAttribution(q.get('utm_campaign'))}}).then(()=>{},()=>{});
}
