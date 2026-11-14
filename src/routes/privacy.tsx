import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title: "Privacy policy — Justdial" }, { name: "description", content: "How Justdial collects, uses and protects your personal information." },
    { property: "og:title", content: "Privacy policy — Justdial" }, { property: "og:description", content: "How Justdial collects, uses and protects your personal information." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const SECTIONS: [string, string][] = [["What we collect","Your name, mobile number, location (with permission), searches and enquiries you make."],["How we use it","To show relevant results, connect you with businesses you contact, and improve our services."],["Sharing","When you send an enquiry, your name and number are shared with the matching businesses. We never sell your data."],["Your choices","You can turn off promotional calls, delete your search history or close your account at any time."],["Security","We use encryption and strict access controls to protect your information."],["Contact","Questions? Write to privacy@justdial.com."]];

function Page() {
  return (
    <div className="container-page grid gap-10 pt-10 lg:grid-cols-[220px_1fr]">
      <nav className="hidden h-fit space-y-2 text-sm lg:sticky lg:top-24 lg:block">{SECTIONS.map(([h], i) => <a key={h} href={`#s${i}`} className="block text-muted-foreground hover:text-foreground">{h}</a>)}</nav>
      <article className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">Last updated 1 Nov 2026</p>
        <h1 className="mt-2 text-4xl font-extrabold md:text-5xl">Privacy policy</h1>
        {SECTIONS.map(([h, p], i) => <section key={h} id={`s${i}`} className="mt-10 scroll-mt-24"><h2 className="text-xl font-bold">{i + 1}. {h}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{p}</p></section>)}
      </article>
    </div>
  );
}
