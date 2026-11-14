import { useNavigate } from "@tanstack/react-router";
import { MapPin, Mic, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES, CITIES, type City } from "@/data/catalog";
import { useCity } from "./city";
import { cn } from "@/lib/utils";
import { Btn } from "./ui";

export function SearchBar({
  size = "lg",
  initial = "",
  initialCity,
}: {
  size?: "lg" | "sm";
  initial?: string;
  initialCity?: string;
}) {
  const { city, setCity } = useCity();
  const [q, setQ] = useState(initial);
  const [focus, setFocus] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setQ(initial);
  }, [initial]);
  useEffect(() => {
    if (initialCity && (CITIES as readonly string[]).includes(initialCity))
      setCity(initialCity as City);
  }, [initialCity, setCity]);
  const sugg = q.trim()
    ? CATEGORIES.filter((c) => c.name.toLowerCase().includes(q.toLowerCase())).slice(0, 6)
    : [];
  const go = (term: string) => {
    setFocus(false);
    navigate({ to: "/search", search: { q: term, city } });
  };
  const lg = size === "lg";
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        go(q);
      }}
      className={cn(
        "relative grid w-full grid-cols-[minmax(0,1fr)_auto] items-stretch rounded-2xl border bg-card sm:flex",
        lg ? "p-1.5 shadow-lift sm:h-16" : "p-1 sm:h-11",
      )}
    >
      <label className="col-span-2 flex h-10 items-center gap-1.5 border-b pl-3 pr-2 sm:h-auto sm:border-b-0 sm:border-r">
        <MapPin className="size-4 text-coral" />
        <span className="sr-only">City</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value as City)}
          className="cursor-pointer bg-transparent text-sm font-semibold outline-none"
        >
          {CITIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setTimeout(() => setFocus(false), 150)}
        placeholder={lg ? "Search for restaurants, doctors, AC repair…" : "Search anything"}
        aria-label="Search"
        className={cn(
          "h-12 min-w-0 flex-1 bg-transparent px-3 focus-visible:ring-2 focus-visible:ring-ring sm:h-auto",
          lg ? "text-base" : "text-sm",
        )}
      />
      <Btn
        type="submit"
        aria-label="Search"
        className={cn("grid place-items-center rounded-xl", lg ? "px-6" : "px-3")}
      >
        <span className="flex items-center gap-2">
          <Search className="size-5" />
          {lg && <span className="hidden sm:inline">Search</span>}
        </span>
      </Btn>
      {focus && sugg.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-popover p-1 shadow-lift">
          {sugg.map((s) => (
            <li key={s.slug}>
              <Btn
                variant="ghost"
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => go(s.name)}
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm"
              >
                <span className="font-semibold">{s.name}</span>
                <span className="text-xs text-muted-foreground">in {city}</span>
              </Btn>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
