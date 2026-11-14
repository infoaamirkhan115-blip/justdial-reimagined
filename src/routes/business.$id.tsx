import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
  Globe,
  BadgeCheck,
  Bookmark,
  Clock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Share2,
  ShieldCheck,
  Star,
  PenLine,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { getCategory, type Business } from "@/data/catalog";
import { useQuery } from "@tanstack/react-query";
import { liveBusinessQ, liveBusinessesQ } from "@/lib/public-data";
import {
  EnquiryForm,
  MiniBusinessCard,
  RatingBadge,
  btnClass,
  Btn,
  BusinessPhoto,
} from "@/components/site/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BusinessOfferings } from "@/components/site/business-offerings";
import { EnquiryPopup } from "@/components/site/enquiry-popup";
import { SaveBusiness } from "@/components/site/save-business";
import { telephone, whatsappUrl, directionsUrl, shareBusiness } from "@/lib/directory-actions";
import { similarBusinesses } from "@/lib/directory-search";
import { supabase } from "@/integrations/supabase/client";
import { ReviewReport } from "@/components/site/review-report";
import { VerificationBadges } from "@/components/site/verification-badges";
import { useDirectoryDefinitions } from "@/lib/managed-directory";
import { useEffect } from "react";
import { trackDirectory } from "@/lib/directory-analytics";

export const Route = createFileRoute("/business/$id")({
  loader: async ({ params, context }) => {
    const r = await supabase
      .from("directory_redirects")
      .select("to_key")
      .eq("kind", "business")
      .eq("from_key", params.id)
      .maybeSingle();
    if (r.error) throw r.error;
    if (r.data)
      throw redirect({ to: "/business/$id", params: { id: r.data.to_key }, statusCode: 301 });
    return {
      b: /^[0-9a-f-]{36}$/.test(params.id)
        ? await context.queryClient.ensureQueryData(liveBusinessQ(params.id))
        : null,
    };
  },
  pendingComponent: () => (
    <div role="status" className="container-page py-24">
      Loading business…
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div role="alert" className="container-page space-y-4 py-24">
      <h1 className="text-2xl font-bold">Couldn't load this business</h1>
      <Btn onClick={reset}>Retry</Btn>
    </div>
  ),
  head: ({ loaderData }) => {
    const b = loaderData?.b;
    const t = b
      ? `${b.name}, ${b.area} ${b.city} — Reviews & Contact | Justdial`
      : "Business — Justdial";
    const d = b
      ? `${b.name} in ${b.area}, ${b.city}. ${b.reviews ? `Rated ${b.rating}/5 by ${b.reviews} customers.` : "No reviews yet."} View contact details and published products and services.`
      : "Business details on Justdial.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "business.business" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  component: BusinessPage,
});

function BusinessPage() {
  const { b } = Route.useLoaderData();
  const { id } = Route.useParams();
  const isUuid = /^[0-9a-f-]{36}$/.test(id);
  const live = useQuery({ ...liveBusinessQ(id), enabled: !b && isUuid });
  if (b) return <BusinessView b={b} />;
  if (isUuid && live.isLoading)
    return <div className="container-page py-24 text-center text-muted-foreground">Loading…</div>;
  if (live.data) return <BusinessView b={live.data} />;
  return (
    <div className="container-page py-24 text-center">
      <h1 className="text-3xl font-extrabold">This business isn't available</h1>
      <p className="mt-2 text-muted-foreground">
        It may have been removed or is still waiting for approval.
      </p>
      <Link to="/categories" className={`${btnClass("primary")} mt-6`}>
        Browse categories
      </Link>
    </div>
  );
}

function BusinessView({ b }: { b: Business }) {
  useEffect(() => { trackDirectory("business_view", { business_id: b.id }); }, [b.id]);
  const { categories } = useDirectoryDefinitions();
  const cat = categories.find((c) => c.slug === b.category) ?? getCategory(b.category);
  const { data: all = [] } = useQuery(liveBusinessesQ);
  const similar = similarBusinesses(all, b);
  const pics = b.gallery?.length ? b.gallery : b.image ? [b.image] : [];
  const wa = whatsappUrl(b.whatsapp);
  const phone = telephone(b.phone);
  const dist = b.live
    ? [5, 4, 3, 2, 1].map((n) =>
        b.reviewList.length
          ? Math.round(
              (b.reviewList.filter((r) => r.rating === n).length / b.reviewList.length) * 100,
            )
          : 0,
      )
    : [62, 22, 9, 4, 3];
  const enquiryContext = {
    businessId: b.id,
    businessName: b.name,
    title: b.name,
    image: b.image || undefined,
    location: `${b.area}, ${b.city}`,
    price: b.price,
    description: b.description,
  };
  return (
    <div className="container-page pb-24 pt-6 md:pb-0">
      <nav className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
        <Link to="/" className="hover:underline">
          Home
        </Link>
        <ChevronRight className="size-4" />
        <Link to="/category/$slug" params={{ slug: b.category }} className="hover:underline">
          {cat?.name}
        </Link>
        <ChevronRight className="size-4" />
        <span className="text-foreground">{b.name}</span>
      </nav>

      <div className="mt-4 grid h-64 grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[2rem] md:h-96">
        <div className={`col-span-4 row-span-2 ${pics.length > 1 ? "md:col-span-2" : ""}`}>
          <BusinessPhoto b={b} />
        </div>
        {pics.slice(1, 5).map((src, i) => (
          <img
            key={src}
            src={src}
            alt={`${b.name} photo ${i + 2}`}
            loading="lazy"
            className="hidden size-full object-cover md:block"
          />
        ))}
      </div>
      {b.image && !b.gallery?.length && (
        <p className="mt-2 text-xs text-muted-foreground">
          Category image · Business photo not provided
        </p>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            {b.logo && (
              <img
                src={b.logo}
                alt={`${b.name} logo`}
                className="size-12 rounded-xl border object-cover"
              />
            )}
            <h1 className="text-3xl font-extrabold md:text-4xl">{b.name}</h1>
            <VerificationBadges id={b.id} />
            {b.trust && (
              <span className="inline-flex items-center gap-1 rounded-full bg-saffron-soft px-2.5 py-1 text-xs font-bold">
                <ShieldCheck className="size-4" />
                Trust
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
            <RatingBadge rating={b.rating} />
            {b.reviews > 0 && (
              <span className="font-semibold">{b.reviews.toLocaleString("en-IN")} ratings</span>
            )}
            <span className="text-muted-foreground">
              {cat?.name} · {b.sub}
              {b.years > 0 && ` · ${b.years} yrs in business`}
            </span>
          </div>
          <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <MapPin className="size-4" />
              {b.address || `${b.area}, ${b.city}`}
              {b.landmark ? ` · ${b.landmark}` : ""}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="size-4" />
              {b.hours || "Contact business for opening hours"}
              {b.days?.length ? ` · ${b.days.length === 7 ? "All days" : b.days.join(", ")}` : ""}
            </span>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {b.live && <EnquiryPopup context={enquiryContext} />}
            {phone && (
              <a href={`tel:${phone}`} onClick={() => trackDirectory("call_click", { business_id: b.id })} className={btnClass("ink")}>
                <Phone className="size-4" />
                {b.phone}
              </a>
            )}
            <Link to="/write-review" search={{ b: b.id }} className={btnClass("outline")}>
              <PenLine className="size-4" />
              Review
            </Link>
            {wa && (
              <a href={wa} onClick={() => trackDirectory("whatsapp_click", { business_id: b.id })} target="_blank" rel="noreferrer" className={btnClass("outline")}>
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            )}
            {b.website && (
              <a href={b.website} target="_blank" rel="noreferrer" className={btnClass("outline")}>
                <Globe className="size-4" />
                Website
              </a>
            )}
            <a
              href={directionsUrl(b)}
              target="_blank"
              rel="noreferrer"
              className={btnClass("outline")}
            >
              <Navigation className="size-4" />
              Directions
            </a>
            <Btn
              variant="outline"
              onClick={async () => {
                try {
                  const result = await shareBusiness(
                    b.name,
                    window.location.origin + `/business/${b.id}`,
                  );
                  if (result === "copied") toast.success("Link copied");
                } catch (error) {
                  if (!(error instanceof Error && error.name === "AbortError"))
                    toast.error("Couldn't share this business. Please copy the page address.");
                }
              }}
            >
              <Share2 className="size-4" />
              Share
            </Btn>
            <SaveBusiness id={b.id} />
          </div>

          <Tabs defaultValue="overview" className="mt-8">
            <TabsList className="h-auto flex-wrap rounded-2xl p-1">
              {["overview", "catalog", "photos", "reviews", "qa"].map((t) => (
                <TabsTrigger key={t} value={t} className="rounded-xl px-4 py-2 capitalize">
                  {t === "qa" ? "Info" : t === "catalog" ? "Products & services" : t}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview" className="mt-6 space-y-4">
              <p className="leading-relaxed">
                {b.description ||
                  "The business has not provided a description yet. Contact them for details."}
              </p>
              <div className="flex flex-wrap gap-2">
                {b.tags.map((t) => (
                  <span key={t} className="rounded-full bg-muted px-3 py-1 text-sm font-medium">
                    {t}
                  </span>
                ))}
              </div>
              {b.price && (
                <p className="text-sm">
                  <span className="font-bold">Price:</span> {b.price}
                </p>
              )}
              {!!b.payments?.length && (
                <p className="text-sm">
                  <span className="font-bold">Payments:</span> {b.payments.join(", ")}
                </p>
              )}
            </TabsContent>
            <TabsContent value="catalog" className="mt-6">
              <BusinessOfferings
                businessId={b.id}
                businessName={b.name}
                businessImage={b.image}
                location={`${b.area}, ${b.city}`}
                services={b.services}
              />
            </TabsContent>
            <TabsContent value="photos" className="mt-6">
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                {pics.map((src, i) => (
                  <a
                    key={src}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-2xl border"
                  >
                    <img
                      src={src}
                      alt={`${b.name} photo ${i + 1}`}
                      loading="lazy"
                      className="aspect-[4/3] size-full object-cover transition hover:scale-105"
                    />
                  </a>
                ))}
              </div>
              {!b.gallery?.length && (
                <p className="mt-3 text-sm text-muted-foreground">
                  The business hasn't added photos yet.
                </p>
              )}
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              {b.reviews > 0 && (
                <div className="grid gap-6 rounded-3xl border bg-card p-6 sm:grid-cols-[160px_1fr]">
                  <div className="text-center">
                    <p className="font-display text-5xl font-extrabold">{b.rating}</p>
                    <div className="mt-1 flex justify-center text-primary">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-4 fill-current" />
                      ))}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{b.reviews} ratings</p>
                  </div>
                  <div className="space-y-1.5">
                    {dist.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <span className="w-3">{5 - i}</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-success"
                            style={{ width: `${p}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-muted-foreground">{p}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <ul className="mt-4 space-y-3">
                {b.reviewList.length === 0 && (
                  <li className="rounded-3xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                    No reviews yet — be the first.
                  </li>
                )}
                {b.reviewList.map((r, i) => (
                  <li key={i} className="rounded-3xl border bg-card p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-full bg-saffron-soft font-bold">
                        {r.name[0]}
                      </span>
                      <div>
                        <p className="font-bold">{r.name}</p>
                        <p className="text-xs text-muted-foreground">{r.date}</p>
                      </div>
                      <RatingBadge rating={r.rating} className="ml-auto" />
                    </div>
                    <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed">{r.text}</p>
                    {r.id && <ReviewReport id={r.id} />}
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="qa" className="mt-6 space-y-3">
              <dl className="divide-y rounded-3xl border bg-card">
                {(
                  [
                    [
                      "Address",
                      [b.address || `${b.area}, ${b.city}`, b.pincode].filter(Boolean).join(" – "),
                    ],
                    ["Landmark", b.landmark],
                    ["Phone", b.phone],
                    ["WhatsApp", b.whatsapp ? `+91 ${b.whatsapp}` : ""],
                    ["Email", b.email],
                    ["Website", b.website],
                    ["Open days", b.days?.join(", ")],
                    ["Hours", b.hours],
                    ["Payments", b.payments?.join(", ")],
                    ["Service coverage", b.serviceAreas?.join(", ")],
                    ...Object.entries(b.attributes ?? {})
                      .filter(([, v]) => v !== "" && v !== null)
                      .map(
                        ([k, v]) =>
                          [
                            categories
                              .find((c) => c.slug === b.category)
                              ?.fields.find((f) => f.key === k)?.label ?? k,
                            String(v),
                          ] as [string, string],
                      ),
                    ["In business", b.years > 0 ? `${b.years} years` : ""],
                  ] as [string, string | undefined][]
                )
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[120px_1fr] gap-3 p-4 text-sm">
                      <dt className="font-bold">{k}</dt>
                      <dd className="break-words text-muted-foreground">{v}</dd>
                    </div>
                  ))}
              </dl>
            </TabsContent>
          </Tabs>
          <p className="mt-8 text-sm text-muted-foreground">
            Is this your business?{" "}
            <Link
              to="/claim/$id"
              params={{ id: b.id }}
              className="font-bold text-foreground underline"
            >
              Claim it for free
            </Link>
          </p>
        </div>
        <aside id="enquire" className="scroll-mt-24 lg:sticky lg:top-24 lg:self-start">
          <EnquiryForm
            businessId={b.live ? b.id : undefined}
            title={`Enquire about ${b.name}`}
            initialMessage={`Enquiry about ${b.name}`}
            subtitle={`Send your requirement to ${b.name}.`}
          />
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-bold">Similar businesses in {b.city}</h2>
          <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-4">
            {similar.map((x) => (
              <MiniBusinessCard key={x.id} b={x} />
            ))}
          </div>
        </section>
      )}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center justify-center gap-3 border-t bg-card p-3 md:hidden">
        {phone && (
          <a href={`tel:${phone}`} onClick={() => trackDirectory("call_click", { business_id: b.id })} className={btnClass("ink")}>
            <Phone className="size-4" />
            Call
          </a>
        )}
        <EnquiryPopup label="Enquire" context={enquiryContext} />
      </div>
    </div>
  );
}
