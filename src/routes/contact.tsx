import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";
import { PageHero } from "@/components/site/page-hero";
import { Btn } from "@/components/site/ui";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Customer care & help — Contact Justdial" }, { name: "description", content: "Get help with searches, listings, payments or your account. Call, chat or write to Justdial customer care." },
    { property: "og:title", content: "Customer care & help — Contact Justdial" }, { property: "og:description", content: "Get help with searches, listings, payments or your account. Call, chat or write to Justdial customer care." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Page,
});

function Page() {
  return (
    <div className="container-page pt-6">
      <PageHero eyebrow="Help centre" title="How can we help?" sub="Our team is available every day, 8 am to 11 pm, in 10+ languages." />
      <div className="mt-8 grid gap-4 md:grid-cols-4">{[[Phone, "Call us", "8888 888 888"], [MessageCircle, "WhatsApp", "Chat with support"], [Mail, "Email", "support@justdial.com"], [MapPin, "Head office", "Goregaon (W), Mumbai"]].map(([I, t, d]) => { const Ic = I as typeof Phone; return <div key={t as string} className="rounded-3xl border bg-card p-5"><span className="grid size-11 place-items-center rounded-xl bg-saffron-soft"><Ic className="size-5" /></span><p className="mt-3 font-bold">{t as string}</p><p className="text-sm text-muted-foreground">{d as string}</p></div>; })}</div>
      <div className="mt-12 grid gap-8 lg:grid-cols-2">
        <section><h2 className="mb-4 text-2xl font-bold">Common questions</h2>
          <Accordion type="single" collapsible className="rounded-3xl border bg-card px-5">{[["How do I edit my business listing?", "Log in, open My business and tap Edit. Changes go live after a quick check."], ["I'm getting too many calls. Can I stop them?", "Yes — open Settings and turn off promotional calls, or reply STOP to any SMS."], ["How do I report a wrong listing?", "Open the business page and tap Report, or write to us with the link."], ["My payment failed but money was deducted.", "It's refunded automatically within 3–5 working days. Contact us if it isn't."]].map(([q, a]) => <AccordionItem key={q} value={q!}><AccordionTrigger className="text-left font-semibold">{q}</AccordionTrigger><AccordionContent className="text-muted-foreground">{a}</AccordionContent></AccordionItem>)}</Accordion>
        </section>
        <form onSubmit={(e) => { e.preventDefault(); toast.success("Ticket raised. We'll reply within 24 hours."); (e.target as HTMLFormElement).reset(); }} className="space-y-3 rounded-3xl border bg-card p-6 shadow-soft">
          <h2 className="text-xl font-bold">Send us a message</h2>
          <input required placeholder="Your name" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <input required type="email" placeholder="Email" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm" />
          <select aria-label="Topic" className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"><option>Search & listings</option><option>My business</option><option>Payments</option><option>Something else</option></select>
          <textarea required rows={4} placeholder="How can we help?" className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
          <Btn type="submit" className="w-full">Submit</Btn>
        </form>
      </div>
    </div>
  );
}
