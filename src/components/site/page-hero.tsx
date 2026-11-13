import type { ReactNode } from "react";
export function PageHero({ eyebrow, title, sub, children, tone = "ink" }: { eyebrow: string; title: ReactNode; sub?: string; children?: ReactNode; tone?: "ink" | "saffron" }) {
  const ink = tone === "ink";
  return (
    <section className={ink ? "grain relative overflow-hidden rounded-[2rem] bg-gradient-ink p-8 text-ink-foreground md:p-14" : "rounded-[2rem] bg-saffron-soft p-8 md:p-14"}>
      <p className={ink ? "text-xs font-bold uppercase tracking-[.18em] text-primary" : "text-xs font-bold uppercase tracking-[.18em] text-coral"}>{eyebrow}</p>
      <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight md:text-6xl">{title}</h1>
      {sub && <p className={ink ? "mt-4 max-w-xl text-ink-muted" : "mt-4 max-w-xl text-muted-foreground"}>{sub}</p>}
      {children && <div className="relative mt-8">{children}</div>}
    </section>
  );
}
