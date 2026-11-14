import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { liveBusinessesQ } from "@/lib/public-data";
import { Btn } from "@/components/site/ui";
import { cn } from "@/lib/utils";

type S = { b?: string | undefined };
export const Route = createFileRoute("/write-review")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): S => ({ b: typeof s["b"] === "string" ? s["b"] : undefined }),
  head: () => ({ meta: [
    { title: "Write a review — Help others choose | Justdial" }, { name: "description", content: "Rate and review a local business you've visited to help others make better choices." },
    { property: "og:title", content: "Write a review — Help others choose | Justdial" }, { property: "og:description", content: "Rate and review a local business you've visited to help others make better choices." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const LABELS = ["", "Terrible", "Poor", "Average", "Good", "Excellent"];

function Page() {
  const { b: pre } = Route.useSearch();
  const { data: live = [] } = useQuery(liveBusinessesQ);
  const all = live;
  const [picked, setBiz] = useState(pre ?? "");
  const biz = picked || all[0]?.id || "";
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [r, setR] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const nav = useNavigate();
  return (
    <div className="container-page grid place-items-center py-10">
      <form onSubmit={async (e) => { e.preventDefault(); if (!r) { toast.error("Tap a star to rate"); return; } if (text.trim().length < 20) { toast.error("Please write at least 20 characters"); return; } if (!name.trim()) { toast.error("Please add your name"); return; }
        const isLive = live.some((x) => x.id === biz);
        if (isLive) { setBusy(true); const { error } = await supabase.from("reviews").insert({ business_id: biz, name: name.trim(), rating: r, text: text.trim() }); setBusy(false); if (error) { toast.error("Couldn't post your review. Please try again."); return; } toast.success("Thanks! Your review is live."); }
        else toast.success("Thanks for your review!");
        nav({ to: "/business/$id", params: { id: biz } }); }} className="w-full max-w-xl rounded-[2rem] border bg-card p-8 shadow-lift">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Write a review</p>
        <h1 className="mt-2 text-3xl font-extrabold">How was your experience?</h1>
        <label className="mt-6 block text-sm font-bold">Business
          <select value={biz} onChange={(e) => setBiz(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal">{all.map((b) => <option key={b.id} value={b.id}>{b.name} — {b.area}, {b.city}</option>)}</select>
        </label>
        <label className="mt-4 block text-sm font-bold">Your name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className="mt-1 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-normal" />
        </label>
        <div className="mt-6">
          <p className="text-sm font-bold">Your rating</p>
          <div className="mt-2 flex items-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setR(n)}><Star className={cn("size-9 transition", n <= (hover || r) ? "fill-primary text-primary" : "text-border")} /></button>)}
            <span className="ml-3 text-sm font-semibold text-muted-foreground">{LABELS[hover || r]}</span>
          </div>
        </div>
        <label className="mt-6 block text-sm font-bold">Your review
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} placeholder="What did you like? What could be better?" className="mt-1 w-full rounded-xl border border-input bg-background p-3 text-sm font-normal" />
        </label>
        <Btn type="submit" disabled={busy} className="mt-6 w-full">{busy ? "Posting…" : "Submit review"}</Btn>
      </form>
    </div>
  );
}
