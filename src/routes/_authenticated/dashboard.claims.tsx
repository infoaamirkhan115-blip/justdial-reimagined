import { createFileRoute } from "@tanstack/react-router";
import { TrustCenter, trustQ } from "@/components/dash/trust-center";
export const Route=createFileRoute("/_authenticated/dashboard/claims")({
 head:()=>({meta:[{title:"Ownership claims — Justdial"},{name:"description",content:"Manage ownership claims in your Justdial workspace."},{property:"og:title",content:"Ownership claims — Justdial"},{property:"og:description",content:"Manage ownership claims securely."},{property:"og:type",content:"website"},{name:"twitter:card",content:"summary"},{name:"robots",content:"noindex"}]}),
 loader:({context})=>context.queryClient.ensureQueryData(trustQ),component:()=> <TrustCenter mode="claims"/>
});
