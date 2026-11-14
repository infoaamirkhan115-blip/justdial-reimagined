import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { reportReview } from "@/lib/trust.functions";
import { Btn } from "./ui";
import { inputCls } from "@/components/dash/shell";
import { Link } from "@tanstack/react-router";
import { Dialog,DialogContent,DialogHeader,DialogTitle } from "@/components/ui/dialog";
export function ReviewReport({id}:{id:string}){
  const {user}=useAuth(),save=useServerFn(reportReview);const [open,setOpen]=useState(false),[reason,setReason]=useState<"spam"|"duplicate"|"harassment"|"personal_data"|"conflict_of_interest"|"other">("spam"),[evidence,setEvidence]=useState(""),[busy,setBusy]=useState(false);
  return <><Btn variant="ghost" className="mt-3" onClick={()=>setOpen(true)}>Report review</Btn><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Report this review</DialogTitle></DialogHeader>{user?<form className="space-y-4" onSubmit={async e=>{e.preventDefault();setBusy(true);try{await save({data:{review_id:id,reason,evidence}});toast.success("Report submitted for review");setOpen(false);}catch(e){toast.error(e instanceof Error?e.message:"Report failed");}finally{setBusy(false);}}}><label className="grid gap-2">Reason<select className={inputCls} value={reason} onChange={e=>setReason(e.target.value as typeof reason)}>{["spam","duplicate","harassment","personal_data","conflict_of_interest","other"].map(r=><option key={r}>{r}</option>)}</select></label><label className="grid gap-2">Supporting evidence<textarea className={inputCls} maxLength={4000} value={evidence} onChange={e=>setEvidence(e.target.value)}/></label><p className="text-sm text-muted-foreground">A negative rating alone is not abuse.</p><Btn disabled={busy} type="submit">Submit report</Btn></form>:<Link to="/auth">Sign in to report a review</Link>}</DialogContent></Dialog></>;
}