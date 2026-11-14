import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Droplets, Flame, Fuel, Smartphone, Tv, Wifi, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/page-hero";
import { Btn, SectionHeader } from "@/components/site/ui";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/recharge")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Bills & Recharge — Pay mobile, electricity, DTH bills | Justdial" }, { name: "description", content: "Recharge mobile and DTH, pay electricity, gas, water and broadband bills in seconds with cashback." },
    { property: "og:title", content: "Bills & Recharge — Pay mobile, electricity, DTH bills | Justdial" }, { property: "og:description", content: "Recharge mobile and DTH, pay electricity, gas, water and broadband bills in seconds with cashback." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const TYPES = [
  { k: "Mobile", i: Smartphone, f: "Mobile number" }, { k: "Electricity", i: Zap, f: "Consumer number" }, { k: "DTH", i: Tv, f: "Subscriber ID" },
  { k: "Gas", i: Flame, f: "Customer ID" }, { k: "Water", i: Droplets, f: "Connection ID" }, { k: "Broadband", i: Wifi, f: "Account number" },
  { k: "FASTag", i: Fuel, f: "Vehicle number" }, { k: "Credit card", i: CreditCard, f: "Card last 4 digits" },
];
const PLANS = [["₹239", "1.5 GB/day · 28 days"], ["₹299", "2 GB/day · 28 days"], ["₹719", "2 GB/day · 84 days"], ["₹2,999", "2.5 GB/day · 365 days"]];

function Page() {
  const [t, setT] = useState(TYPES[0]!);
  const [id, setId] = useState("");
  const [amt, setAmt] = useState("");
  return (
    <div className="container-page pt-6">
      <PageHero eyebrow="Bills & recharge" title={<>Pay any bill in <span className="text-primary">10 seconds.</span></>} sub="UPI, cards and wallets. Instant confirmation and up to ₹100 cashback." />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div className="grid grid-cols-4 gap-3">{TYPES.map((x) => (
            <button key={x.k} onClick={() => setT(x)} aria-pressed={t.k === x.k} className={cn("flex flex-col items-center gap-2 rounded-2xl border p-4 text-sm font-semibold transition", t.k === x.k ? "border-ink bg-ink text-ink-foreground" : "bg-card hover:bg-muted")}><x.i className="size-6" />{x.k}</button>))}</div>
          {t.k === "Mobile" && <section className="mt-10"><SectionHeader eyebrow="Popular" title="Recharge plans" /><div className="grid gap-3 sm:grid-cols-2">{PLANS.map(([p, d]) => <button key={p} onClick={() => setAmt(p!.replace(/[₹,]/g, ""))} className="flex items-center justify-between rounded-2xl border bg-card p-5 text-left lift"><div><p className="font-display text-2xl font-extrabold">{p}</p><p className="text-sm text-muted-foreground">{d}</p></div><span className="text-sm font-bold text-coral">Select</span></button>)}</div></section>}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); if (!id || !amt) { toast.error("Fill in both fields"); return; } toast.success(`₹${amt} ${t.k} payment successful (demo)`); setId(""); setAmt(""); }} className="h-fit space-y-3 rounded-3xl border bg-card p-6 shadow-lift lg:sticky lg:top-24">
          <h2 className="text-xl font-bold">{t.k} payment</h2>
          <input value={id} onChange={(e) => setId(e.target.value)} placeholder={t.f} aria-label={t.f} className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Amount (₹)" aria-label="Amount" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <Btn type="submit" className="w-full">Proceed to pay</Btn>
          <p className="text-center text-xs text-muted-foreground">100% secure · Bharat BillPay certified</p>
        </form>
      </div>
    </div>
  );
}
