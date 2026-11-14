import { useQuery, queryOptions } from "@tanstack/react-query";
import { publicContent } from "@/lib/content-commerce.functions";
import { type ContentPayload } from "@/lib/content-commerce-rules";
import { liveBusinessesQ } from "@/lib/public-data";
import { MiniBusinessCard } from "./ui";
import { useCity } from "./city";
export const publicContentQ=queryOptions({queryKey:["public-content"],queryFn:()=>publicContent(),staleTime:30000});
export function ContentBlock({payload:p}:{payload:ContentPayload}) {
  return <section className="py-6">{p.demo&&<p className="text-sm font-bold text-coral">Demonstration content</p>}{p.image&&<img src={p.image} alt={p.title} className="mb-4 aspect-[3/1] w-full rounded-lg object-cover"/>}<h2 className="text-2xl font-bold">{p.title}</h2><p className="mt-3 whitespace-pre-wrap leading-relaxed text-muted-foreground">{p.body}</p>{p.href&&<a href={p.href} className="mt-3 inline-block font-bold underline">{p.kind==="contact"?p.href:"View details"}</a>}{p.kind==="testimonial"&&<p className="mt-2 text-xs text-muted-foreground">Source: {p.source}</p>}</section>;
}
export function ManagedHome() {
  const {city}=useCity(),content=useQuery(publicContentQ),businesses=useQuery(liveBusinessesQ);
  return <div className="container-page mt-12">{content.isError&&<p role="alert">Additional content could not load.</p>}{content.data?.filter(c=>["home_section","banner","faq","testimonial"].includes(c.kind)&&(!c.payload.city||c.payload.city===city)).sort((a,b)=>a.payload.position-b.payload.position).map(c=><div key={c.key}><ContentBlock payload={c.payload}/>{c.kind==="home_section"&&<div className="no-scrollbar flex gap-4 overflow-x-auto pb-4">{businesses.data?.filter(b=>b.city===(c.payload.city||city)&&(!c.payload.category||b.category===c.payload.category)&&(!c.payload.locality||b.area===c.payload.locality)).slice(0,10).map(b=><MiniBusinessCard key={b.id} b={b}/>)}</div>}</div>)}</div>;
}
export function ManagedPage({page,title}:{page:string,title:string}) {
  const q=useQuery(publicContentQ),items=q.data?.filter(c=>c.kind==="page"&&(c.key===page||c.payload.href===`/${page}`))??[];
  return <article className="container-page max-w-4xl py-10"><h1 className="text-4xl font-extrabold">{title}</h1>{q.isPending?<p className="py-8">Loading content…</p>:q.isError?<p role="alert">Content could not load.</p>:items.length?items.map(c=><ContentBlock key={c.key} payload={c.payload}/>):<p className="mt-6 text-muted-foreground">Approved {title.toLowerCase()} content has not been published yet.</p>}</article>;
}
export function ManagedLinks({kind}:{kind:"navigation"|"footer"|"contact"}) {
  const q=useQuery(publicContentQ);
  return <>{q.data?.filter(c=>c.kind===kind).sort((a,b)=>a.payload.position-b.payload.position).map(c=><a key={c.key} href={c.payload.href||"/contact"} className="inline-block px-3 py-2 text-sm font-semibold hover:underline">{c.payload.title}{kind==="contact"&&c.payload.body&&` · ${c.payload.body}`}</a>)}</>;
}