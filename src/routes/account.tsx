import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Bookmark, Gift, LogOut, MessageSquare, Settings, Star } from "lucide-react";
import { toast } from "sonner";
import { BUSINESSES } from "@/data/catalog";
import { MiniBusinessCard, btnClass } from "@/components/site/ui";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [
    { title: "My account — Saved places, enquiries & reviews | Justdial" }, { name: "description", content: "Manage your saved businesses, enquiries, reviews and notifications." },
    { property: "og:title", content: "My account — Saved places, enquiries & reviews | Justdial" }, { property: "og:description", content: "Manage your saved businesses, enquiries, reviews and notifications." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const ENQ = [
  { b: "CoolTech AC Services", s: "3 quotes received", d: "Today", st: "Active" },
  { b: "SafeShift Packers", s: "Booked for 22 Nov", d: "2 days ago", st: "Booked" },
  { b: "Aarogya Clinic", s: "Appointment done", d: "Last week", st: "Closed" },
];

function Page() {
  return (
    <div className="container-page grid gap-8 pt-8 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit rounded-3xl border bg-card p-5">
        <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-full bg-gradient-saffron font-display text-xl font-extrabold text-primary-foreground">A</span><div><p className="font-bold">Aamir Khan</p><p className="text-xs text-muted-foreground">+91 98•••••210</p></div></div>
        <nav className="mt-6 space-y-1 text-sm font-semibold">
          {[[Bookmark, "Saved"], [MessageSquare, "My enquiries"], [Star, "My reviews"], [Gift, "Rewards"], [Bell, "Notifications"], [Settings, "Settings"]].map(([I, l]) => { const Ic = I as typeof Bell; return <button key={l as string} onClick={() => toast(l as string)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-muted"><Ic className="size-4" />{l as string}</button>; })}
          <Link to="/login" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-destructive hover:bg-muted"><LogOut className="size-4" />Log out</Link>
        </nav>
      </aside>
      <div>
        <h1 className="text-3xl font-extrabold md:text-4xl">Namaste, Aamir 👋</h1>
        <div className="mt-6 grid grid-cols-3 gap-3">{[["12", "Saved"], ["5", "Enquiries"], ["340", "Reward points"]].map(([v, l]) => <div key={l} className="rounded-3xl bg-saffron-soft p-5"><p className="font-display text-3xl font-extrabold">{v}</p><p className="text-sm text-muted-foreground">{l}</p></div>)}</div>
        <section className="mt-10"><h2 className="mb-4 text-xl font-bold">Recent enquiries</h2>
          <ul className="divide-y rounded-3xl border bg-card">{ENQ.map((e) => <li key={e.b} className="flex items-center justify-between gap-4 p-5"><div><p className="font-bold">{e.b}</p><p className="text-sm text-muted-foreground">{e.s} · {e.d}</p></div><span className="rounded-full bg-success-soft px-3 py-1 text-xs font-bold text-success">{e.st}</span></li>)}</ul>
        </section>
        <section className="mt-10"><div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Saved places</h2><Link to="/write-review" className={btnClass("outline")}>Write a review</Link></div>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">{BUSINESSES.filter((_, i) => i % 6 === 0).map((b) => <MiniBusinessCard key={b.id} b={b} />)}</div>
        </section>
      </div>
    </div>
  );
}
