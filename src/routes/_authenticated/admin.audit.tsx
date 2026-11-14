import { createFileRoute } from "@tanstack/react-router";
import { TrustCenter, trustQ } from "@/components/dash/trust-center";
export const Route=createFileRoute("/_authenticated/admin/audit")({
 head:()=>({meta:[{title:"Trust audit history — Justdial"},{name:"description",content:"Manage trust audit history in your Justdial workspace."},{property:"og:title",content:"Trust audit history — Justdial"},{property:"og:description",content:"Manage trust audit history securely."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"robots",content:"noindex"}]}),
 loader:({context})=>context.queryClient.ensureQueryData(trustQ),component:()=> <TrustCenter mode="audit"/>
});
