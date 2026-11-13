import { createFileRoute, Link } from "@tanstack/react-router";
import { BadgeCheck, Bookmark, Clock, MapPin, MessageCircle, Navigation, Phone, Share2, ShieldCheck, Star, PenLine, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { getCategory, type Business } from "@/data/catalog";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessQ, liveBusinessesQ } from "@/lib/public-data";
import { EnquiryForm, MiniBusinessCard, RatingBadge, btnClass } from "@/components/site/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/business/$id")({
  loader: async ({ params, context }) => ({ b: /^[0-9a-f-]{36}$/.test(params.id) ? await context.queryClient.ensureQueryData(liveBusinessQ(params.id)).catch(() => null) : null }),
  head: ({ loaderData }) => {
    const b = loaderData?.b;
    const t = b ? `${b.name}, ${b.area} ${b.city} — Reviews & Contact | Justdial` : "Business — Justdial";
    const d = b ? `${b.name} in ${b.area}, ${b.city}: rated ${b.rating}/5 by ${b.reviews} customers. See prices, timings and get the best quote.` : "Business details on Justdial.";
    return { meta: [
      { title: t }, { name: "description", content: d },
      { property: "og:title", content: t }, { property: "og:description", content: d },
      { property: "og:type", content: "business.business" }, { name: "twitter:card", content: "summary" },
    ] };
  },
  component: BusinessPage,
});

function BusinessPage() {
  const { b } = Route.useLoaderData();
  const { id } = Route.useParams();
  const isUuid = /^[0-9a-f-]{36}$/.test(id);
  const live = useQuery({ ...liveBusinessQ(id), enabled: !b && isUuid });
  if (b) return <BusinessView b={b} />;
  if (isUuid && live.isLoading) return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  if (live.data) return <BusinessView b={live.data} />;
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-extrabold">This business isn't available</h1>
      <p className="mt-2 text-muted-foreground">It may have been removed or is still waiting for approval.</p>
      <Link to="/categories" className={`${btnClass("primary")} mt-6`}>Browse categories</Link>
    </div>
  );
}

function BusinessView({ b }: { b: Business }) {
  const cat = getCategory(b.category);
  const { data: all = [] } = useQuery(liveBusinessesQ);
  const similar = all.filter((x) => x.category === b.category && x.id !== b.id);
  const dist = b.live
    ? [5, 4, 3, 2, 1].map((n) => (b.reviewList.length ? Math.round((b.reviewList.filter((r) => r.rating === n).length / b.reviewList.length) * 100) : 0))
    : [62, 22, 9, 4, 3];
  const actions = [
    { icon: MessageCircle, label: "WhatsApp" }, { icon: Navigation, label: "Directions" },
    { icon: Share2, label: "Share" }, { icon: Bookmark, label: "Save" }, { icon: PenLine, label: "Review" },
  ];
  return (
    <div className="container-page pt-6">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground"><Link to="/" className="hover:underline">Home</Link><ChevronRight className="size-4" /><Link to="/category/$slug" params={{ slug: b.category }} className="hover:underline">{cat?.name}</Link><ChevronRight className="size-4" /><span className="text-foreground">{b.name}</span></nav>

      <div className="mt-4 grid h-64 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[2rem] md:h-96">
        <img src={b.image} alt={b.name} width={944} height={704} className="col-span-4 row-span-2 size-full object-cover md:col-span-2" />
        {[1, 2, 3, 4].map((i) => <img key={i} src={similar[i % Math.max(similar.length, 1)]?.image ?? b.image} alt="" loading="lazy" className="hidden size-full object-cover md:block" />)}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-extrabold md:text-4xl">{b.name}</h1>
            {b.verified && <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2.5 py-1 text-xs font-bold text-success"><BadgeCheck className="size-4" />Verified</span>}
            {b.trust && <span className="inline-flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-xs font-bold"><ShieldCheck className="size-4" />Trust</span>}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <RatingBadge rating={b.rating} /><span className="font-semibold">{b.reviews.toLocaleString("en-IN")} ratings</span>
            <span className="text-muted-foreground">{cat?.name} · {b.sub} · {b.years} yrs in business</span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><MapPin className="size-4" />{b.area}, {b.city} · {b.distance} km away</span>
            <span className="flex items-center gap-2"><Clock className="size-4" /><span className={b.open ? "font-bold text-success" : "font-bold text-destructive"}>{b.open ? "Open now" : "Closed"}</span> · {b.hours}</span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${b.phone}`} className={btnClass("ink")}><Phone className="size-4" />{b.phone}</a>
            <Link to="/write-review" search={{ b: b.id }} className={btnClass("outline")}><PenLine className="size-4" />Review</Link>
            {actions.filter((a) => a.label !== "Review").map((a) => <button key={a.label} onClick={() => toast.success(`${a.label} — done`)} className={btnClass("outline")}><a.icon className="size-4" />{a.label}</button>)}
          </div>

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="h-auto flex-wrap rounded-2xl p-1">
              {["overview", "services", "reviews", "qa"].map((t) => <TabsTrigger key={t} value={t} className="rounded-xl px-4 py-2 capitalize">{t === "qa" ? "Q&A" : t}</TabsTrigger>)}
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-4">
              <p className="leading-relaxed">{b.description || <>{b.name} is a trusted {b.sub.toLowerCase()} {cat?.name.toLowerCase()} in {b.area}, {b.city}, serving customers for over {b.years} years. Known for {b.tags.join(", ").toLowerCase()}.</>}</p>
              <div className="flex flex-wrap gap-2">{b.tags.map((t) => <span key={t} className="rounded-full bg-muted px-3 py-1 text-sm font-medium">{t}</span>)}</div>
              {b.price && <p className="text-sm"><span className="font-bold">Price:</span> {b.price}</p>}
            </TabsContent>
            <TabsContent value="services" className="mt-6">
              <ul className="divide-y rounded-3xl border bg-card">{b.services.length === 0 && <li className="p-4 text-sm text-muted-foreground">Call or send an enquiry for prices.</li>}{b.services.map((s) => <li key={s.name} className="flex items-center justify-between p-4"><span className="font-semibold">{s.name}</span><span className="font-bold">{s.price}</span></li>)}</ul>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="grid gap-6 rounded-3xl border bg-card p-6 sm:grid-cols-[160px_1fr]">
                <div className="text-center"><p className="font-display text-5xl font-extrabold">{b.rating}</p><div className="mt-1 flex justify-center text-primary">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}</div><p className="mt-1 text-xs text-muted-foreground">{b.reviews} ratings</p></div>
                <div className="space-y-1.5">{dist.map((p, i) => <div key={i} className="flex items-center gap-2 text-sm"><span className="w-3">{5 - i}</span><div className="h-2 flex-1 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-success" style={{ width: `${p}%` }} /></div><span className="w-8 text-right text-muted-foreground">{p}%</span></div>)}</div>
              </div>
              <ul className="mt-4 space-y-3">{b.reviewList.length === 0 && <li className="rounded-3xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">No reviews yet — be the first.</li>}{b.reviewList.map((r, i) => (
                <li key={i} className="rounded-3xl border bg-card p-5">
                  <div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-saffron-soft font-bold">{r.name[0]}</span><div><p className="font-bold">{r.name}</p><p className="text-xs text-muted-foreground">{r.date}</p></div><RatingBadge rating={r.rating} className="ml-auto" /></div>
                  <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{r.text}</p>
                </li>))}</ul>
            </TabsContent>
            <TabsContent value="qa" className="mt-6 space-y-3">
              {[["Do you offer home service?", "Yes, within 10 km of our location."], ["Do you accept UPI?", "Yes — UPI, cards and cash are accepted."]].map(([q, a]) => <div key={q} className="rounded-3xl border bg-card p-5"><p className="font-bold">Q. {q}</p><p className="mt-1 text-muted-foreground">A. {a}</p></div>)}
            </TabsContent>
          </Tabs>
          <p className="mt-8 text-sm text-muted-foreground">Is this your business? <Link to="/free-listing" className="font-bold text-foreground underline">Claim it for free</Link></p>
        </div>
        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start"><EnquiryForm businessId={b.live ? b.id : undefined} subtitle={`${b.name} usually replies in under 10 minutes.`} /></aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">Similar businesses nearby</h2>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">{similar.map((x) => <MiniBusinessCard key={x.id} b={x} />)}</div>
        </section>
      )}
    </div>
  );
}
