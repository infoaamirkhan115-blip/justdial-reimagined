import { Link } from "@tanstack/react-router";
import { BadgeCheck, MapPin, Phone, MessageCircle, Star, ShieldCheck, Send } from "lucide-react";
import { toast } from "sonner";
import { useState, type ReactNode } from "react";
import { getCategory, type Business } from "@/data/catalog";
import { DynIcon } from "./icon";
import { cn } from "@/lib/utils";

export function RatingBadge({ rating, className }: { rating: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-lg bg-success px-2 py-0.5 text-sm font-bold text-success-foreground", className)}>
      {rating.toFixed(1)} <Star className="size-3.5 fill-current" />
    </span>
  );
}

export function Btn({ variant = "primary", className, children, ...p }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ink" | "outline" | "success" | "ghost" }) {
  const v = {
    primary: "bg-primary text-primary-foreground hover:brightness-105 shadow-soft",
    ink: "bg-ink text-ink-foreground hover:opacity-90",
    outline: "border border-input bg-card text-foreground hover:bg-muted",
    success: "bg-success text-success-foreground hover:opacity-90",
    ghost: "text-foreground hover:bg-muted",
  }[variant];
  return <button className={cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition active:scale-[.98] disabled:opacity-50", v, className)} {...p}>{children}</button>;
}

export const btnClass = (variant: "primary" | "ink" | "outline" = "primary") =>
  cn("inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-bold transition active:scale-[.98]",
    variant === "primary" && "bg-primary text-primary-foreground shadow-soft hover:brightness-105",
    variant === "ink" && "bg-ink text-ink-foreground hover:opacity-90",
    variant === "outline" && "border border-input bg-card hover:bg-muted");

export function SectionHeader({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[.18em] text-coral">{eyebrow}</p>}
        <h2 className="text-2xl font-bold md:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function CategoryTile({ slug, name, icon }: { slug: string; name: string; icon: string }) {
  return (
    <Link to="/category/$slug" params={{ slug }} className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-4 text-center lift">
      <span className="grid size-14 place-items-center rounded-2xl bg-saffron-soft text-ink transition group-hover:bg-primary">
        <DynIcon name={icon} className="size-6" strokeWidth={1.75} />
      </span>
      <span className="text-sm font-semibold leading-tight">{name}</span>
    </Link>
  );
}

export function MiniBusinessCard({ b }: { b: Business }) {
  return (
    <Link to="/business/$id" params={{ id: b.id }} className="block w-72 shrink-0 overflow-hidden rounded-2xl border bg-card lift">
      <div className="relative aspect-[4/3]">
        <img src={b.image} alt={b.name} loading="lazy" width={944} height={704} className="size-full object-cover" />
        {b.open && <span className="absolute left-3 top-3 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">Open now</span>}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold leading-snug">{b.name}</h3>
          <RatingBadge rating={b.rating} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{b.sub} · {b.area}, {b.city}</p>
        <p className="mt-2 text-sm font-semibold">{b.price}</p>
      </div>
    </Link>
  );
}

export function BusinessCard({ b }: { b: Business }) {
  const cat = getCategory(b.category);
  return (
    <article className="flex flex-col gap-4 rounded-3xl border bg-card p-4 shadow-soft sm:flex-row">
      <Link to="/business/$id" params={{ id: b.id }} className="relative shrink-0 overflow-hidden rounded-2xl sm:w-56">
        <img src={b.image} alt={b.name} loading="lazy" width={944} height={704} className="aspect-[4/3] size-full object-cover transition hover:scale-105" />
        {b.sponsored && <span className="absolute left-2 top-2 rounded-md bg-ink/85 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-ink-foreground">Sponsored</span>}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex flex-wrap items-center gap-2">
          <Link to="/business/$id" params={{ id: b.id }} className="text-lg font-bold hover:underline">{b.name}</Link>
          {b.verified && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-xs font-bold text-success"><BadgeCheck className="size-3.5" />Verified</span>}
          {b.trust && <span className="inline-flex items-center gap-1 rounded-full bg-saffron-soft px-2 py-0.5 text-xs font-bold text-ink"><ShieldCheck className="size-3.5" />Trust</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
          <RatingBadge rating={b.rating} />
          <span className="font-semibold">{b.reviews.toLocaleString("en-IN")} ratings</span>
          <span className="text-muted-foreground">· {b.years} yrs in business</span>
        </div>
        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="size-4" />{b.area}, {b.city} · {b.distance} km</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{cat?.name} · {b.sub}</span>
          {b.tags.map((t) => <span key={t} className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{t}</span>)}
        </div>
        <p className="mt-2 line-clamp-1 text-sm italic text-muted-foreground">“{b.highlight}”</p>
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <a href={`tel:${b.phone}`} className={btnClass("ink")}><Phone className="size-4" />Call</a>
          <button onClick={() => toast.success(`Opening WhatsApp chat with ${b.name}`)} className={cn(btnClass("outline"), "text-success")}><MessageCircle className="size-4" />WhatsApp</button>
          <button onClick={() => toast.success(`Enquiry sent to ${b.name}. They'll call you shortly.`)} className={btnClass("primary")}><Send className="size-4" />Get best price</button>
        </div>
      </div>
    </article>
  );
}

export function EnquiryForm({ title = "Get the best price", subtitle, cta = "Send enquiry" }: { title?: string; subtitle?: string; cta?: string }) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^[6-9]\d{9}$/.test(phone)) return toast.error("Please enter a valid 10-digit mobile number");
        toast.success("Done! Top businesses will call you within minutes.");
        setPhone(""); setName("");
      }}
      className="rounded-3xl border bg-card p-5 shadow-soft"
    >
      <h3 className="text-lg font-bold">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      <div className="mt-4 space-y-3">
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
        <div className="flex h-11 overflow-hidden rounded-xl border border-input bg-background">
          <span className="grid place-items-center border-r px-3 text-sm font-semibold text-muted-foreground">+91</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))} inputMode="numeric" placeholder="Mobile number" className="w-full bg-transparent px-3 text-sm outline-none" />
        </div>
        <Btn type="submit" className="w-full">{cta}</Btn>
        <p className="text-center text-xs text-muted-foreground">Free · No spam · Your number is shared only with matching businesses</p>
      </div>
    </form>
  );
}
