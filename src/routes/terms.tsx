import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title: "Terms of use — Justdial" }, { name: "description", content: "The terms that apply when you use Justdial's website, app and services." },
    { property: "og:title", content: "Terms of use — Justdial" }, { property: "og:description", content: "The terms that apply when you use Justdial's website, app and services." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const SECTIONS: [string, string][] = [["Using Justdial","By using our website or app you agree to these terms. You must be 18 or older, or use the service with a guardian."],["Listings & content","Business information is provided by businesses and users. We work to keep it accurate but cannot guarantee every detail."],["Your account","Keep your login details safe. You are responsible for activity on your account."],["Reviews","Reviews must reflect genuine experiences. We may remove reviews that are fake, abusive or promotional."],["Payments","Paid plans and bill payments are governed by the pricing shown at purchase. Refunds follow our refund policy."],["Changes","We may update these terms. Continued use means you accept the updated terms."]];

function Page() {
  return (
    <div className="container-page grid gap-10 pt-10 lg:grid-cols-[220px_1fr]">
      <nav className="hidden h-fit space-y-2 text-sm lg:sticky lg:top-24 lg:block">{SECTIONS.map(([h], i) => <a key={h} href={`#s${i}`} className="block text-muted-foreground hover:text-foreground">{h}</a>)}</nav>
      <article className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Last updated 1 Nov 2026</p>
        <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Terms of use</h1>
        {SECTIONS.map(([h, p], i) => <section key={h} id={`s${i}`} className="mt-10 scroll-mt-24"><h2 className="text-xl font-bold">{i + 1}. {h}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{p}</p></section>)}
      </article>
    </div>
  );
}
