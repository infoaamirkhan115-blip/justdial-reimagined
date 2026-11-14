import { useDirectoryDefinitions } from "@/lib/managed-directory";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, PhoneCall, Store, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Btn, SectionHeader } from "@/components/site/ui";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { saveListingDraft, readListingDraft, clearListingDraft } from "@/lib/listing-draft";

export const Route = createFileRoute("/free-listing")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "List your business free — Get customers who are already searching | Justdial" },
      {
        name: "description",
        content:
          "Submit your business details for review and receive saved customer enquiries.",
      },
      {
        property: "og:title",
        content: "List your business free — Get customers who are already searching | Justdial",
      },
      {
        property: "og:description",
        content:
          "Submit your business details for review and receive saved customer enquiries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Page() {
  const { categories: CATEGORIES, cities: CITIES } = useDirectoryDefinitions();
  const [form, setForm] = useState({ name: "", phone: "", city: "Noida", cat: "restaurants" });
  const nav = useNavigate();
  useEffect(() => {
    const d = readListingDraft();
    if (d) setForm({ name: d.name, phone: d.phone, city: d.city, cat: d.category });
  }, []);
  return (
    <div className="container-page pt-6">
      <section className="grid items-center gap-10 rounded-[2rem] bg-saffron-soft p-8 md:grid-cols-[1.2fr_1fr] md:p-14">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-coral">
            For business owners
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">
            Get customers who are already searching for you.
          </h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Submit accurate business details and photos. New listings require approval before publication.
          </p>

        </div>
        <form
          id="signup"
          onSubmit={(e) => {
            e.preventDefault();
            if (!/^[6-9]\d{9}$/.test(form.phone)) {
              toast.error("Enter a valid 10-digit mobile number");
              return;
            }
            try {
              saveListingDraft({
                name: form.name,
                phone: form.phone,
                city: form.city,
                category: form.cat,
              });
              nav({ to: "/auth", search: { redirect: "/dashboard/businesses?new=true" } });
            } catch {
              toast.error("Could not keep your draft. Please retry.");
            }
          }}
          className="space-y-3 rounded-3xl border bg-card p-6 shadow-lift"
        >
          <h2 className="text-xl font-bold">List your business</h2>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            aria-label="Business name"
            maxLength={100}
            placeholder="Business name"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
          <input
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
            }
            inputMode="numeric"
            aria-label="Mobile number"
            placeholder="Mobile number"
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
          />
          <div className="grid grid-cols-2 gap-3">
            <select
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              aria-label="City"
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <select
              value={form.cat}
              onChange={(e) => setForm({ ...form, cat: e.target.value })}
              aria-label="Category"
              className="h-11 rounded-xl border border-input bg-background px-3 text-sm"
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <Btn type="submit" className="w-full">
            Start getting customers
          </Btn>
          <Btn
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              clearListingDraft();
              setForm({ name: "", phone: "", city: "Noida", cat: "restaurants" });
            }}
          >
            Discard draft
          </Btn>
          <p className="text-center text-xs text-muted-foreground">
            Draft kept on this device for up to 7 days.
          </p>
        </form>
      </section>

      <section className="mt-20">
        <SectionHeader eyebrow="How it works" title="Live in three steps" />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            [Store, "Add your details", "Name, address, photos and timings."],
            [PhoneCall, "Listing review", "Staff review the details before publication. Information verification is a separate evidence-based process."],
            [TrendingUp, "Receive leads", "Customers can contact your published listing or send an enquiry."],
          ].map(([I, t, d], i) => {
            const Ic = I as typeof Store;
            return (
              <div key={i} className="rounded-3xl border bg-card p-6">
                <Ic className="size-7 text-coral" />
                <h3 className="mt-4 text-lg font-bold">{t as string}</h3>
                <p className="text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-3xl">
        <h2 className="mb-4 text-center text-3xl font-bold">Questions, answered</h2>
        <Accordion type="single" collapsible className="rounded-3xl border bg-card px-5">
          {[
            [
              "Is the free listing really free?",
              "Yes. Your basic listing, photos and reviews are free forever.",
            ],
            [
              "How do I get leads?",
              "Customers call you directly or send enquiries that arrive by SMS and WhatsApp.",
            ],
            ["Can I cancel a paid plan?", "Yes, plans are monthly and you can cancel any time."],
          ].map(([q, a]) => (
            <AccordionItem key={q} value={q!}>
              <AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </div>
  );
}
