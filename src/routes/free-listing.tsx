import { createFileRoute } from "@tanstack/react-router";
import { Check, PhoneCall, Store, TrendingUp, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CATEGORIES, CITIES, STATS } from "@/data/catalog";
import { Btn, SectionHeader } from "@/components/site/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/free-listing")({
  head: () => ({ meta: [
    { title: "List your business free — Get customers who are already searching | Justdial" }, { name: "description", content: "Add your business to Justdial for free in 2 minutes. Get calls and WhatsApp leads from customers searching near you." },
    { property: "og:title", content: "List your business free — Get customers who are already searching | Justdial" }, { property: "og:description", content: "Add your business to Justdial for free in 2 minutes. Get calls and WhatsApp leads from customers searching near you." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const PLANS = [
  { name: "Free", price: "₹0", note: "forever", f: [true, true, false, false, false, false], cta: "Start free" },
  { name: "Premium", price: "₹999", note: "/month", f: [true, true, true, true, false, false], cta: "Choose Premium", hot: true },
  { name: "Platinum", price: "₹2,999", note: "/month", f: [true, true, true, true, true, true], cta: "Choose Platinum" },
];
const FEATURES = ["Business listing & photos", "Customer reviews", "Higher ranking in search", "Verified badge", "Top-of-category placement", "Dedicated account manager & 100 lead credits"];

function Page() {
  const [form, setForm] = useState({ name: "", phone: "", city: "Mumbai", cat: "restaurants" });
  return (
    <div className="container-page pt-6">
      <section className="grid items-center gap-10 rounded-[2rem] bg-saffron-soft p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">For business owners</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">Get customers who are already searching for you.</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">Crores of people search every day. Put your business in front of them — free.</p>
          <div className="mt-8 grid grid-cols-2 gap-4">{STATS.slice(0, 2).map((s) => <div key={s.label}><p className="font-display text-3xl font-extrabold">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p></div>)}</div>
        </div>
        <form id="signup" onSubmit={(e) => { e.preventDefault(); if (!/^[6-9]\d{9}$/.test(form.phone)) return toast.error("Enter a valid 10-digit mobile number"); toast.success(`${form.name} is on its way! We'll verify and go live within 24 hours.`); setForm({ ...form, name: "", phone: "" }); }} className="space-y-3 rounded-3xl border bg-card p-6 shadow-lift">
          <h2 className="text-xl font-bold">List your business</h2>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Business name" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })} inputMode="numeric" placeholder="Mobile number" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} aria-label="City" className="h-11 rounded-xl border border-input bg-background px-3 text-sm">{CITIES.map((c) => <option key={c}>{c}</option>)}</select>
            <select value={form.cat} onChange={(e) => setForm({ ...form, cat: e.target.value })} aria-label="Category" className="h-11 rounded-xl border border-input bg-background px-3 text-sm">{CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select>
          </div>
          <Btn type="submit" className="w-full">Start getting customers</Btn>
          <p className="text-center text-xs text-muted-foreground">Takes 2 minutes · No credit card</p>
        </form>
      </section>

      <section className="mt-20">
        <SectionHeader eyebrow="How it works" title="Live in three steps" />
        <div className="grid gap-4 md:grid-cols-3">{[[Store, "Add your details", "Name, address, photos and timings."], [PhoneCall, "Get verified", "A quick call or video check earns your Verified badge."], [TrendingUp, "Receive leads", "Calls, WhatsApp chats and enquiries start flowing in."]].map(([I, t, d], i) => { const Ic = I as typeof Store; return <div key={i} className="rounded-3xl border bg-card p-6"><Ic className="size-7 text-coral" /><h3 className="mt-4 text-lg font-bold">{t as string}</h3><p className="text-sm text-muted-foreground">{d as string}</p></div>; })}</div>
      </section>

      <section className="mt-20">
        <SectionHeader eyebrow="Plans" title="Grow at your pace" />
        <div className="grid gap-4 md:grid-cols-3">{PLANS.map((p) => (
          <div key={p.name} className={cn("relative flex flex-col rounded-3xl border bg-card p-6", p.hot && "border-2 border-primary shadow-lift")}>
            {p.hot && <span className="absolute -top-3 left-6 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">Most popular</span>}
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="mt-2"><span className="font-display text-4xl font-extrabold">{p.price}</span> <span className="text-muted-foreground">{p.note}</span></p>
            <ul className="mt-6 flex-1 space-y-2.5 text-sm">{FEATURES.map((f, i) => <li key={f} className={cn("flex gap-2", !p.f[i] && "text-muted-foreground")}>{p.f[i] ? <Check className="size-4 shrink-0 text-success" /> : <X className="size-4 shrink-0" />}{f}</li>)}</ul>
            <a href="#signup" className={cn("mt-6 inline-flex min-h-11 items-center justify-center rounded-xl text-sm font-bold", p.hot ? "bg-primary text-primary-foreground" : "border border-input hover:bg-muted")}>{p.cta}</a>
          </div>))}</div>
      </section>

      <section className="mt-20 grid gap-4 md:grid-cols-2">
        {[["My salon gets 40+ enquiries a month. Half of my new customers say they found us here.", "Meena R., Glow Studio Salon, Pune"], ["Platinum put us at the top for AC repair in Andheri. Revenue grew 3x in one summer.", "Asif K., CoolTech AC Services, Mumbai"]].map(([q, a]) => <figure key={a} className="rounded-3xl bg-gradient-ink p-8 text-ink-foreground"><blockquote className="font-display text-xl font-bold leading-snug md:text-2xl">“{q}”</blockquote><figcaption className="mt-4 text-sm text-ink-muted">{a}</figcaption></figure>)}
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-4 text-center text-3xl font-bold">Questions, answered</h2>
        <Accordion type="single" collapsible className="rounded-3xl border bg-card px-5">
          {[["Is the free listing really free?", "Yes. Your basic listing, photos and reviews are free forever."], ["How do I get leads?", "Customers call you directly or send enquiries that arrive by SMS and WhatsApp."], ["Can I cancel a paid plan?", "Yes, plans are monthly and you can cancel any time."]].map(([q, a]) => <AccordionItem key={q} value={q}><AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}
        </Accordion>
      </section>
    </div>
  );
}
