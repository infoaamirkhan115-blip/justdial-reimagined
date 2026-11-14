import {createFileRoute} from '@tanstack/react-router';
import {LeadOperations,leadOpsQ} from '@/components/dash/lead-operations';
export const Route=createFileRoute('/_authenticated/dashboard/operations')({
 validateSearch:(s:Record<string,unknown>)=>({requirement:typeof s['requirement']==='string'?s['requirement']:undefined,lead:typeof s['lead']==='string'?s['lead']:undefined}),
 head:()=>({meta:[{title:'Lead operations — Justdial dashboard'},{name:'description',content:'Manage lead operations in your Justdial dashboard workspace.'},{property:'og:title',content:'Lead operations — Justdial dashboard'},{property:'og:description',content:'Saved requests, accountable actions and real outcomes.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),
 component:()=> <LeadOperations owner={true} initialRequirement={Route.useSearch().requirement} initialLead={Route.useSearch().lead}/>
});
