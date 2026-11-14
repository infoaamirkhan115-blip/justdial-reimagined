import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AlertCircle, Plus } from "lucide-react";
import { myBusinessesQ, myLeadsQ, myReviewsQ } from "@/lib/owner-data";
import { Empty, PageTitle, Pill, Stat, timeAgo } from "@/components/dash/shell";
import { btnClass } from "@/components/site/ui";
import { useAuth } from "@/lib/auth";
import { OperationsOverview } from "@/components/dash/operations-overview";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  head: () => ({
    meta: [
      { title: "Business overview \u2014 Justdial" },
      { name: "description", content: "Manage business overview in your Justdial workspace." },
      { property: "og:title", content: "Business overview \u2014 Justdial" },
      {
        property: "og:description",
        content: "Manage business overview in your Justdial workspace.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(myBusinessesQ(context.user.id)),
      context.queryClient.ensureQueryData(myLeadsQ(context.user.id)),
      context.queryClient.ensureQueryData(myReviewsQ(context.user.id)),
    ]),
  component: Overview,
});

function Overview() {
  const { user } = Route.useRouteContext();
  const { user: u } = useAuth();
  const { data: biz } = useSuspenseQuery(myBusinessesQ(user.id));
  const { data: leads } = useSuspenseQuery(myLeadsQ(user.id));
  const { data: reviews } = useSuspenseQuery(myReviewsQ(user.id));
  const avg = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : "—";
  const fresh = leads.filter((l) => l.status === "new").length;
  const name = (u?.user_metadata?.["full_name"] as string | undefined)?.split(" ")[0];
  return (
    <>
      <PageTitle
        title={name ? `Namaste, ${name}` : "Namaste"}
        sub="Here's how your business is doing."
        action={
          <Link to="/dashboard/businesses" search={{ new: true }} className={btnClass("primary")}>
            <Plus className="size-4" />
            Add listing
          </Link>
        }
      />
      {biz
        .filter((b) => b.status !== "approved")
        .map((b) => (
          <div
            key={b.id}
            className="mb-3 flex items-start gap-3 rounded-2xl bg-saffron-soft p-4 text-sm"
          >
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <p>
              <span className="font-bold">{b.name}</span> is{" "}
              <span className="font-bold">{b.status}</span>.
              {b.status === "pending" && " Our team reviews new listings within 24 hours."}
              {b.admin_note && <> Note from our team: “{b.admin_note}”</>}
            </p>
          </div>
        ))}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat
          label="Live listings"
          value={biz.filter((b) => b.status === "approved").length}
          hint={`${biz.length} total`}
        />
        <Stat label="New leads" value={fresh} hint={`${leads.length} all time`} tone="saffron" />
        <Stat
          label="Average rating"
          value={avg}
          hint={`${reviews.length} reviews`}
          tone="success"
        />
        <Stat
          label="Reported wins"
          value={leads.filter((l) => l.status === "won").length}
          tone="coral"
        />
      </div>
      <div className="mt-8"><OperationsOverview owner /></div>
      {biz.length === 0 ? (
        <div className="mt-8">
          <Empty
            title="Add your first listing"
            sub="It's free. Customers can find and call you as soon as it's approved."
            action={
              <Link
                to="/dashboard/businesses"
                search={{ new: true }}
                className={btnClass("primary")}
              >
                Add listing
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Latest leads</h2>
              <Link to="/dashboard/leads" className="text-sm font-bold hover:underline">
                View all
              </Link>
            </div>
            {leads.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                No leads yet. They'll appear here as customers enquire.
              </p>
            ) : (
              <ul className="divide-y">
                {leads.slice(0, 5).map((l) => (
                  <li key={l.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                    <div>
                      <p className="font-semibold">
                        {l.name} ·{" "}
                        <a href={`tel:${l.phone}`} className="text-coral">
                          {l.phone}
                        </a>
                      </p>
                      <p className="text-muted-foreground">
                        {l.businesses.name} · {timeAgo(l.created_at)}
                      </p>
                    </div>
                    <Pill v={l.status} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-3xl border bg-card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-bold">Recent reviews</h2>
              <Link to="/dashboard/reviews" className="text-sm font-bold hover:underline">
                View all
              </Link>
            </div>
            {reviews.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <ul className="divide-y">
                {reviews.slice(0, 4).map((r) => (
                  <li key={r.id} className="py-3 text-sm">
                    <p className="font-semibold">
                      {"★".repeat(r.rating)}
                      <span className="text-muted-foreground">
                        {"★".repeat(5 - r.rating)}
                      </span> · {r.name}
                    </p>
                    <p className="line-clamp-2 text-muted-foreground">{r.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </>
  );
}
