import {createFileRoute} from '@tanstack/react-router';
import {SupportCenter,supportQ} from '@/components/dash/support-center';
export const Route=createFileRoute('/_authenticated/admin/support')({
 validateSearch:(s:Record<string,unknown>)=>({ticket:typeof s['ticket']==='string'?s['ticket']:undefined}),
 head:()=>({meta:[{title:'Support tickets — Justdial admin'},{name:'description',content:'Manage support tickets in your Justdial admin workspace.'},{property:'og:title',content:'Support tickets — Justdial admin'},{property:'og:description',content:'Saved requests, accountable actions and real outcomes.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),
 component:()=> <SupportCenter staff={true} initialTicket={Route.useSearch().ticket}/>
});
