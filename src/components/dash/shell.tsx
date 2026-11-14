import { Link, useRouterState } from "@tanstack/react-router";
import { ExternalLink, LogOut, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Logo } from "@/components/site/layout";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export type NavItem = { to: string; label: string; icon: LucideIcon; exact?: boolean };

export function DashShell({ label, nav, children }: { label: string; nav: NavItem[]; children: ReactNode }) {
  const { user, isStaff, signOut } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const active = (n: NavItem) => (n.exact ? path === n.to : path.startsWith(n.to));
  return (
    <div className="min-h-screen bg-muted/40 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 z-30 flex flex-col border-b bg-gradient-ink text-ink-foreground lg:h-screen lg:border-b-0">
        <div className="flex items-center justify-between p-5 [&_span]:text-ink-foreground"><Logo light /><span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">{label}</span></div>
        <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:overflow-visible">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition", active(n) ? "bg-ink-foreground/15 text-ink-foreground" : "text-ink-muted hover:bg-ink-foreground/10 hover:text-ink-foreground")}>
              <n.icon className="size-4" />{n.label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-1 border-t border-ink-foreground/10 p-3 text-sm lg:block">
          {isStaff && label !== "Admin" && <Link to="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2 text-ink-muted hover:bg-ink-foreground/10">Staff panel</Link>}
          {label === "Admin" && <Link to="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2 text-ink-muted hover:bg-ink-foreground/10">Business dashboard</Link>}
          <Link to="/" className="flex items-center gap-3 rounded-xl px-3 py-2 text-ink-muted hover:bg-ink-foreground/10"><ExternalLink className="size-4" />View site</Link>
          <p className="truncate px-3 pt-2 text-xs text-ink-muted">{user?.email}</p>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-ink-muted hover:bg-ink-foreground/10"><LogOut className="size-4" />Sign out</button>
        </div>
      </aside>
      <div className="min-w-0">
        <div className="flex items-center justify-end gap-2 border-b bg-card px-4 py-2 text-sm lg:hidden">
          <Link to="/" className="rounded-lg px-3 py-1.5 hover:bg-muted">View site</Link>
          <button onClick={signOut} className="rounded-lg px-3 py-1.5 hover:bg-muted">Sign out</button>
        </div>
        <main className="mx-auto max-w-6xl p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageTitle({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>{sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}</div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, tone = "default" }: { label: string; value: ReactNode; hint?: string; tone?: "default" | "saffron" | "success" | "coral" }) {
  const t = { default: "bg-card border", saffron: "bg-saffron-soft", success: "bg-success-soft", coral: "bg-coral-soft" }[tone];
  return <div className={cn("rounded-2xl p-5", t)}><p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-1 font-display text-3xl font-extrabold">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

const TONES: Record<string, string> = {
  approved: "bg-success-soft text-success", published: "bg-success-soft text-success", won: "bg-success-soft text-success",
  pending: "bg-saffron-soft text-ink", new: "bg-saffron-soft text-ink", contacted: "bg-accent text-accent-foreground",
  rejected: "bg-coral-soft text-coral", suspended: "bg-coral-soft text-coral", hidden: "bg-muted text-muted-foreground", lost: "bg-muted text-muted-foreground",
  free: "bg-muted text-muted-foreground", premium: "bg-saffron-soft text-ink", platinum: "bg-ink text-ink-foreground",
};
export function Pill({ v }: { v: string }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize", TONES[v] ?? "bg-muted")}>{v}</span>;
}

export function Empty({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return <div className="rounded-3xl border border-dashed bg-card p-10 text-center"><p className="text-lg font-bold">{title}</p>{sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}{action && <div className="mt-4">{action}</div>}</div>;
}

export const inputCls = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm";
export const timeAgo = (d: string) => {
  const s = (Date.now() - new Date(d).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.round(s / 60))} min ago`;
  if (s < 86400) return `${Math.round(s / 3600)} h ago`;
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
