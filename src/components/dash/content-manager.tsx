import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Eye, History, Save, Send, Plus } from "lucide-react";
import { contentAdmin, saveContent, unpublishContent } from "@/lib/content-commerce.functions";
import { contentKinds, contentSchema, type ContentPayload } from "@/lib/content-commerce-rules";
import { Btn } from "@/components/site/ui";
import { PageTitle, inputCls, Pill } from "./shell";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const initial: ContentPayload = {key:"",kind:"home_section",title:"",body:"",city:"",category:"",locality:"",source:"",href:"",image:"",position:0,demo:false,approval:false};
export function ContentManager() {
  const qc=useQueryClient(), read=useServerFn(contentAdmin), save=useServerFn(saveContent), unpublish=useServerFn(unpublishContent);
  const q=useQuery({queryKey:["content-admin"],queryFn:()=>read()});
  const [form,setForm]=useState(initial),[reason,setReason]=useState(""),[preview,setPreview]=useState(false),[history,setHistory]=useState<string|null>(null),[busy,setBusy]=useState(false);
  const field=(key:keyof ContentPayload,value:unknown)=>setForm(f=>({...f,[key]:value}));
  async function submit(publish:boolean) {setBusy(true);try{await save({data:{payload:form,publish,reason}});toast.success(publish?"Published":"Draft saved");await qc.invalidateQueries();}catch(e){toast.error(e instanceof Error?e.message:"Could not save");}finally{setBusy(false);}}
  return <><PageTitle title="Content studio" action={<Btn variant="outline" onClick={()=>setForm(initial)}><Plus className="size-4"/>New content</Btn>}/>
    {q.isError&&<p role="alert">Content access unavailable.</p>}
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <nav className="space-y-2">{q.data?.content.map(c=><div key={c.id} className="border-b pb-3"><Btn variant="ghost" className="w-full justify-start" onClick={()=>{const p=contentSchema.safeParse(c.draft);if(p.success)setForm(p.data);}}>{c.key}</Btn><div className="flex gap-2"><Pill v={c.published?"published":"draft"}/><Btn variant="ghost" aria-label={`History ${c.key}`} onClick={()=>setHistory(c.id)}><History className="size-4"/></Btn>{c.published&&<Btn variant="ghost" onClick={async()=>{try{await unpublish({data:{id:c.id,reason}});await qc.invalidateQueries();}catch(e){toast.error(e instanceof Error?e.message:"Denied");}}}>Unpublish</Btn>}</div></div>)}</nav>
      <form className="space-y-4" onSubmit={e=>{e.preventDefault();void submit(false);}}>
        <div className="grid gap-4 sm:grid-cols-2"><label>Content key<input className={inputCls} value={form.key} onChange={e=>field("key",e.target.value)}/></label><label>Type<select className={inputCls} value={form.kind} onChange={e=>field("kind",e.target.value)}>{contentKinds.map(k=><option key={k}>{k}</option>)}</select></label></div>
        <label className="block">Title<input className={inputCls} value={form.title} onChange={e=>field("title",e.target.value)}/></label>
        <label className="block">Content / answer / redirect source<textarea className="min-h-48 w-full rounded-lg border bg-background p-3" value={form.body} onChange={e=>field("body",e.target.value)}/></label>
        <div className="grid gap-4 sm:grid-cols-3">{(["city","category","locality"] as const).map(k=><label key={k} className="capitalize">{k}<input className={inputCls} value={form[k]} onChange={e=>field(k,e.target.value)}/></label>)}</div>
        <div className="grid gap-4 sm:grid-cols-2">{(["source","href","image"] as const).map(k=><label key={k}>{k==="source"?"Provenance / official source":k==="href"?"Link / redirect destination":"Image URL"}<input className={inputCls} value={form[k]} onChange={e=>field(k,e.target.value)}/></label>)}<label>Position<input type="number" min={0} className={inputCls} value={form.position} onChange={e=>field("position",Number(e.target.value))}/></label></div>
        <div className="flex flex-wrap gap-6"><label className="flex gap-2"><input type="checkbox" checked={form.demo} onChange={e=>field("demo",e.target.checked)}/>Clearly labelled demonstration</label><label className="flex gap-2"><input type="checkbox" checked={form.approval} onChange={e=>field("approval",e.target.checked)}/>Provenance / creative approved</label></div>
        <label className="block">Change reason<input className={inputCls} value={reason} onChange={e=>setReason(e.target.value)} minLength={5} required/></label>
        <div className="flex flex-wrap gap-3"><Btn type="submit" disabled={busy}><Save className="size-4"/>Save draft</Btn><Btn variant="outline" onClick={()=>setPreview(true)}><Eye className="size-4"/>Preview</Btn><Btn disabled={busy} onClick={()=>void submit(true)}><Send className="size-4"/>Publish</Btn></div>
      </form>
    </div>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogTitle>{form.title}</DialogTitle>{form.demo&&<Pill v="Demo"/>}{form.image&&/^https:\/\//.test(form.image)&&<img src={form.image} alt={form.title} className="aspect-video w-full object-cover"/>}<p className="whitespace-pre-wrap">{form.body}</p>{form.city&&<p>{form.city} · {form.category} · {form.locality}</p>}{form.source&&<p>Source: {form.source}</p>}</DialogContent></Dialog>
    <Dialog open={!!history} onOpenChange={()=>setHistory(null)}><DialogContent className="max-h-[85vh] overflow-y-auto"><DialogTitle>Revision history</DialogTitle>{q.data?.history.filter(h=>h.content_id===history).map(h=><div key={h.id} className="border-b py-3"><p>Revision {h.revision} · {h.action} · {new Date(h.created_at).toLocaleString()}</p><p>{h.reason}</p><Btn variant="outline" onClick={()=>{const p=contentSchema.safeParse(h.payload);if(p.success){setForm(p.data);setHistory(null);}}}>Load as draft</Btn></div>)}</DialogContent></Dialog>
  </>;
}