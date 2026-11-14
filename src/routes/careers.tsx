import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeader } from "@/components/site/ui";

export const Route = createFileRoute("/careers")({
  staticData: { sitemap: true },
  head: () => ({ meta: [
    { title: "Careers at Justdial — Build local search for India" }, { name: "description", content: "Join the team helping crores of people find local businesses. Open roles in tech, sales, product and design." },
    { property: "og:title", content: "Careers at Justdial — Build local search for India" }, { property: "og:description", content: "Join the team helping crores of people find local businesses. Open roles in tech, sales, product and design." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

const JOBS = [
  ["Senior Frontend Engineer", "Engineering", "Mumbai"], ["Product Designer", "Design", "Mumbai"], ["Data Scientist — Search", "Engineering", "Bengaluru"],
  ["Business Development Executive", "Sales", "Delhi"], ["Customer Success Lead", "Support", "Hyderabad"], ["Product Manager — B2B", "Product", "Mumbai"],
];

function Page() {
  return (
    <div className="container-page pt-6">
      <PageHero eyebrow="Careers" title={<>Help 140 crore people <span className="text-primary">find what they need.</span></>} sub="12,000+ people in 300+ cities building India's local search engine." />
      <section className="mt-12 grid gap-4 md:grid-cols-3">{[["Real impact", "Your work reaches crores of users and lakhs of small businesses."], ["Grow fast", "Learning budgets, mentorship and internal moves across teams."], ["Look after you", "Health cover for family, flexible hours, and a great canteen."]].map(([t, d]) => <div key={t} className="rounded-3xl bg-saffron-soft p-6"><h3 className="text-lg font-bold">{t}</h3><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>)}</section>
      <section className="mt-12"><SectionHeader eyebrow="Open roles" title={`${JOBS.length} positions`} />
        <ul className="divide-y rounded-3xl border bg-card">{JOBS.map(([t, team, c]) => <li key={t}><button onClick={() => toast.success(`Application form for ${t} (demo)`)} className="flex w-full items-center justify-between gap-4 p-5 text-left hover:bg-muted"><div><p className="font-bold">{t}</p><p className="flex items-center gap-1 text-sm text-muted-foreground">{team} · <MapPin className="size-3.5" />{c}</p></div><ArrowRight className="size-5" /></button></li>)}</ul>
      </section>
    </div>
  );
}
