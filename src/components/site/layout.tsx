import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Building2, CalendarCheck, Home, Search, User, Facebook, Instagram, Twitter, Youtube, Linkedin } from "lucide-react";
import { useState } from "react";
import { CATEGORIES, CITIES } from "@/data/catalog";
import { SearchBar } from "./search-bar";
import { btnClass } from "./ui";
import { useCity } from "./city";
import { cn } from "@/lib/utils";

export function Logo({ light }: { light?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Justdial home">
      <span className="grid size-9 place-items-center rounded-xl bg-gradient-saffron font-display text-lg font-extrabold text-primary-foreground">jd</span>
      <span className={cn("font-display text-xl font-extrabold tracking-tight", light && "text-ink-foreground")}>justdial</span>
    </Link>
  );
}

export function Header() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [lang, setLang] = useState<"EN" | "हिं">("EN");
  const showSearch = path !== "/";
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-lg">
      <div className="container-page flex h-16 items-center gap-4">
        <Logo />
        <div className="hidden flex-1 md:block">{showSearch && <div className="max-w-xl"><SearchBar size="sm" /></div>}</div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          <Link to="/b2b" className="hidden rounded-lg px-3 py-2 hover:bg-muted lg:block">B2B</Link>
          <Link to="/advertise" className="hidden rounded-lg px-3 py-2 hover:bg-muted lg:block">Advertise</Link>
          <button onClick={() => setLang(lang === "EN" ? "हिं" : "EN")} className="rounded-lg px-3 py-2 hover:bg-muted" aria-label="Switch language">{lang}</button>
          <button className="hidden rounded-lg p-2 hover:bg-muted sm:block" aria-label="Notifications"><Bell className="size-5" /></button>
          <Link to="/free-listing" className={cn(btnClass("outline"), "hidden sm:inline-flex")}>Free listing</Link>
          <Link to="/login" className={btnClass("ink")}>Login</Link>
        </nav>
      </div>
    </header>
  );
}

export function MobileNav() {
  const items = [
    { to: "/", label: "Home", icon: Home },
    { to: "/categories", label: "Search", icon: Search },
    { to: "/b2b", label: "B2B", icon: Building2 },
    { to: "/search", label: "Bookings", icon: CalendarCheck },
    { to: "/login", label: "Account", icon: User },
  ] as const;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {items.map(({ to, label, icon: I }) => (
        <Link key={label} to={to} activeOptions={{ exact: true }} className="flex flex-col items-center gap-0.5 py-2 text-[11px] font-semibold text-muted-foreground [&.active]:text-foreground">
          <I className="size-5" />{label}
        </Link>
      ))}
    </nav>
  );
}

export function Footer() {
  const { setCity } = useCity();
  return (
    <footer className="mt-24 bg-gradient-ink pb-24 text-ink-foreground md:pb-0">
      <div className="container-page grid gap-10 py-16 md:grid-cols-5">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm text-ink-muted">India's local search engine. Find, compare and connect with trusted businesses near you — in one search.</p>
          <div className="mt-6 flex gap-2">
            {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((I, i) => <a key={i} href="#" aria-label="Social link" className="grid size-10 place-items-center rounded-xl bg-ink-foreground/10 hover:bg-ink-foreground/20"><I className="size-4" /></a>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold">Company</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><Link to="/about" className="hover:text-ink-foreground">About us</Link></li>
            <li><Link to="/categories" className="hover:text-ink-foreground">All categories</Link></li>
            <li><Link to="/b2b" className="hover:text-ink-foreground">B2B marketplace</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold">For business</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li><Link to="/free-listing" className="hover:text-ink-foreground">Free listing</Link></li>
            <li><Link to="/advertise" className="hover:text-ink-foreground">Advertise</Link></li>
            <li><Link to="/free-listing" className="hover:text-ink-foreground">Plans & pricing</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 text-sm font-bold">Popular cities</h3>
          <ul className="grid grid-cols-2 gap-2 text-sm text-ink-muted">
            {CITIES.map((c) => <li key={c}><Link to="/search" search={{ q: "", city: c }} onClick={() => setCity(c)} className="hover:text-ink-foreground">{c}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="container-page border-t border-ink-foreground/10 py-6">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-muted">Popular searches</p>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-muted">
          {CATEGORIES.slice(0, 20).map((c) => <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} className="hover:text-ink-foreground">{c.name}</Link>)}
        </div>
        <p className="mt-6 text-xs text-ink-muted">© 2026 Justdial Ltd. Redesign concept. All rights reserved.</p>
      </div>
    </footer>
  );
}
