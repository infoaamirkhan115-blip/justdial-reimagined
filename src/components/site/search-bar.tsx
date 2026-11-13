import { useNavigate } from "@tanstack/react-router";
import { MapPin, Mic, Search } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, CITIES, type City } from "@/data/catalog";
import { useCity } from "./city";
import { cn } from "@/lib/utils";

export function SearchBar({ size = "lg", initial = "" }: { size?: "lg" | "sm"; initial?: string }) {
  const { city, setCity } = useCity();
  const [q, setQ] = useState(initial);
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();
  const sugg = q.trim() ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  const go = (term: string) => { setFocus(false); navigate({ to: "/search", search: { q: term, city } }); };
  const lg = size === "lg";
  return (
    <form onSubmit={(e) => { e.preventDefault(); go(q); }} className={cn("relative flex w-full items-stretch rounded-2xl border bg-card", lg ? "h-16 p-1.5 shadow-lift" : "h-11 p-1")}>
      <label className={cn("flex items-center gap-1.5 border-r pl-3 pr-2", !lg && "hidden sm:flex")}>
        <MapPin className="size-4 text-coral" />
        <span className="sr-only">City</span>
        <select value={city} onChange={(e) => setCity(e.target.value as City)} className="cursor-pointer bg-transparent text-sm font-semibold outline-none">
          {CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>
      <input
        value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
        placeholder={lg ? "Search for restaurants, doctors, AC repair…" : "Search anything"}
        aria-label="Search" className={cn("min-w-0 flex-1 bg-transparent px-3 outline-none", lg ? "text-base" : "text-sm")}
      />
      {lg && <button type="button" aria-label="Voice search" className="hidden px-3 text-muted-foreground hover:text-foreground sm:block"><Mic className="size-5" /></button>}
      <button type="submit" aria-label="Search" className={cn("grid place-items-center rounded-xl bg-primary font-bold text-primary-foreground", lg ? "px-6" : "px-3")}>
        <span className="flex items-center gap-2"><Search className="size-5" />{lg && <span className="hidden sm:inline">Search</span>}</span>
      </button>
      {focus && sugg.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-1 shadow-lift">
          {sugg.map((s) => (
            <li key={s.slug}>
              <button type="button" onMouseDown={() => go(s.name)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm hover:bg-muted">
                <span className="font-semibold">{s.name}</span><span className="text-xs text-muted-foreground">in {city}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
