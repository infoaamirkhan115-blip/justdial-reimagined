import { queryOptions, useSuspenseQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { trustData, trustAction, evidenceLink } from "@/lib/trust.functions";
import { staffRoles, permissionMatrix } from "@/lib/trust-rules";
import { Btn } from "@/components/site/ui";
import { PageTitle, Pill, Empty, inputCls } from "./shell";
import { ClaimEvidence } from "./claim-evidence";
export const trustQ = queryOptions({ queryKey: ["trust"], queryFn: () => trustData() });
export function TrustCenter({
  mode = "claims",
}: {
  mode?: "claims" | "verification" | "staff" | "reports" | "audit";
}) {
  const { data } = useSuspenseQuery(trustQ),
    qc = useQueryClient(),
    action = useServerFn(trustAction),
    link = useServerFn(evidenceLink);
  const [reason, setReason] = useState(""),
    [state, setState] = useState("under_review"),
    [contacts, setContacts] = useState(""),
    [expiry, setExpiry] = useState(""),
    [search, setSearch] = useState(""),
    [busy, setBusy] = useState(false);
  const [business, setBusiness] = useState(""),
    [scope, setScope] = useState(""),
    [summary, setSummary] = useState(""),
    [evidence, setEvidence] = useState(""),
    [user, setUser] = useState(""),
    [role, setRole] = useState<(typeof staffRoles)[number]>("support"),
    [city, setCity] = useState(""),
    [category, setCategory] = useState("");
  const own = data.staff.filter((s) => s.user_id === data.userId),
    superAdmin = own.some((s) => s.role === "super_admin"),
    moderator = superAdmin || own.some((s) => s.role === "listing_moderator");
  const run = async (d: Parameters<typeof action>[0]["data"]) => {
    setBusy(true);
    try {
      await action({ data: d });
      toast.success("Decision saved");
      await qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };
  const title = {
    claims: "Ownership claims",
    verification: "Business verification",
    staff: "Staff permissions",
    reports: "Review reports & appeals",
    audit: "Trust audit history",
  }[mode];
  const exp = expiry && Number.isFinite(new Date(expiry).getTime()) ? new Date(expiry).toISOString() : null;
  return (
    <>
      <PageTitle title={title} />
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          aria-label="Search trust records"
          placeholder="Search records"
          className={inputCls}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      {mode !== "audit" && (
        <div className="mb-6 grid gap-3 border-y py-4 md:grid-cols-2">
          <label className="text-sm font-bold">
            Decision reason / appeal
            <textarea
              aria-label="Decision reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className={inputCls}
              maxLength={4000}
            />
          </label>
          <label className="text-sm font-bold">
            Expiry (optional)
            <input
              type="datetime-local"
              aria-label="Decision expiry"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className={inputCls}
            />
          </label>
        </div>
      )}
      {mode === "claims" && (
        <>
          <div className="mb-5 flex flex-wrap gap-3">
            <select
              aria-label="Claim decision state"
              className={inputCls}
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {[
                "evidence_requested",
                "under_review",
                "approved",
                "rejected",
                "revoked",
                "expired",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <input
              aria-label="Independently verified contacts"
              placeholder="Independently checked contact methods, comma separated"
              value={contacts}
              onChange={(e) => setContacts(e.target.value)}
              className={inputCls}
            />
          </div>
          {!data.claims.length && <Empty title="No ownership claims" />}
          {data.claims
            .filter((c) => JSON.stringify(c).toLowerCase().includes(search.toLowerCase()))
            .map((c) => (
              <article key={c.id} className="mb-3 space-y-3 rounded-lg border bg-card p-5">
                <div className="flex flex-wrap gap-3">
                  <h2 className="font-bold">
                    {data.businesses.find((b) => b.id === c.business_id)?.name ?? c.business_id}
                  </h2>
                  <Pill v={c.status} />
                </div>
                <p className="text-sm">
                  Claimant: {c.identity_name} · {c.contact}
                </p>
                <p className="whitespace-pre-wrap text-sm">
                  Requested corrections: {c.corrections || "None"}
                </p>
                <p className="text-sm text-muted-foreground">{c.reason}</p>
                <p className="text-xs">
                  Competing active claims:{" "}
                  {
                    data.claims.filter(
                      (x) =>
                        x.business_id === c.business_id &&
                        x.id !== c.id &&
                        !["rejected", "revoked", "expired"].includes(x.status),
                    ).length
                  }
                </p>
                <div className="flex flex-wrap gap-2">
                  {c.evidence.map((p, i) => (
                    <Btn
                      key={p}
                      variant="outline"
                      onClick={async () => {
                        try {
                          const url = await link({ data: p });
                          window.open(url, "_blank", "noopener,noreferrer");
                        } catch {
                          toast.error("Evidence access denied");
                        }
                      }}
                    >
                      Evidence {i + 1}
                    </Btn>
                  ))}
                  {moderator && (
                    <Btn
                      disabled={busy || reason.trim().length < 5 || c.claimant_id === data.userId}
                      onClick={() =>
                        run({
                          action: "claim",
                          id: c.id,
                          state: state as "under_review",
                          reason,
                          contacts: contacts
                            .split(",")
                            .map((x) => x.trim())
                            .filter(Boolean),
                          expiry: exp,
                        })
                      }
                    >
                      Save claim decision
                    </Btn>
                  )}
                </div>
              </article>
            ))}
        </>
      )}
      {mode === "verification" && (
        <>
          <p className="mb-5 text-sm">
            Ownership, information checks, subscriptions and sponsorship are separate.
          </p>
          <h2 className="mb-3 font-bold">Legacy flags needing evidence audit</h2>
          {data.businesses
            .filter((b) => b.verified && !data.verifications.some((v) => v.business_id === b.id))
            .map((b) => (
              <p key={b.id} className="mb-2 text-sm">
                {b.name} — historical flag; evidence not recorded
              </p>
            ))}
          {moderator && (
            <form
              className="my-6 grid gap-3 border-y py-5"
              onSubmit={(e) => {
                e.preventDefault();
                void run({
                  action: "verification",
                  business,
                  scope,
                  summary,
                  evidence,
                  reason,
                  expiry: exp,
                  revoke: null,
                });
              }}
            >
              <select
                aria-label="Verification business"
                className={inputCls}
                required
                value={business}
                onChange={(e) => setBusiness(e.target.value)}
              >
                <option value="">Select business</option>
                {data.businesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <input
                required
                aria-label="Verification scope"
                placeholder="What was checked"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                className={inputCls}
              />
              <input
                required
                aria-label="Public verification summary"
                placeholder="Public badge explanation (no private details)"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className={inputCls}
              />
              <input
                required
                aria-label="Private evidence reference"
                placeholder="Private evidence reference"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className={inputCls}
              />
              <Btn disabled={busy || reason.trim().length < 5}>Record information check</Btn>
            </form>
          )}
          {data.verifications.map((v) => (
            <article key={v.id} className="mb-3 rounded-lg border bg-card p-4">
              <h3 className="font-bold">
                {data.businesses.find((b) => b.id === v.business_id)?.name} · {v.scope}
              </h3>
              <p>{v.public_summary}</p>
              <p className="text-xs">
                {v.status} · Checked {new Date(v.checked_at).toLocaleDateString()}
              </p>
              {moderator && v.status === "active" && (
                <Btn
                  variant="outline"
                  disabled={busy || reason.trim().length < 5}
                  onClick={() =>
                    run({
                      action: "verification",
                      business: v.business_id,
                      scope: v.scope,
                      summary: v.public_summary,
                      evidence: v.evidence_reference,
                      reason,
                      expiry: null,
                      revoke: v.id,
                    })
                  }
                >
                  Revoke check
                </Btn>
              )}
            </article>
          ))}
        </>
      )}
      {mode === "staff" && (
        <>
          {superAdmin && (
            <form
              className="grid gap-3 border-y py-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                void run({
                  action: "staff",
                  user,
                  role,
                  city: city.trim() || null,
                  category: category.trim() || null,
                  remove: false,
                  reason,
                });
              }}
            >
              <select
                aria-label="Staff account"
                className={inputCls}
                required
                value={user}
                onChange={(e) => setUser(e.target.value)}
              >
                <option value="">Select existing account</option>
                {data.profiles
                  .filter((p) => p.id !== data.userId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.id}
                    </option>
                  ))}
              </select>
              <select
                aria-label="Staff role"
                value={role}
                onChange={(e) => setRole(e.target.value as typeof role)}
                className={inputCls}
              >
                {staffRoles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
              <input
                aria-label="Staff city scope"
                placeholder="City scope (blank: all)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={inputCls}
              />
              <input
                aria-label="Staff category scope"
                placeholder="Category slug scope (blank: all)"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputCls}
              />
              <Btn disabled={busy || reason.trim().length < 5}>Assign permission role</Btn>
            </form>
          )}
          <div className="my-5 space-y-3">
            {data.staff.map((s) => (
              <article key={s.id} className="flex flex-wrap items-center gap-3 border-b py-3">
                <strong>
                  {data.profiles.find((p) => p.id === s.user_id)?.full_name || s.user_id}
                </strong>
                <Pill v={s.role} />
                <span className="text-sm">
                  {s.city || "All cities"} · {s.category || "All categories"}
                </span>
                {superAdmin && s.user_id !== data.userId && (
                  <Btn
                    variant="outline"
                    disabled={busy || reason.trim().length < 5}
                    onClick={() =>
                      run({
                        action: "staff",
                        user: s.user_id,
                        role: s.role as typeof role,
                        city: s.city,
                        category: s.category,
                        remove: true,
                        reason,
                      })
                    }
                  >
                    Remove role
                  </Btn>
                )}
              </article>
            ))}
          </div>
          <h2 className="font-bold">Permissions matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <tbody>
                {staffRoles.map((r) => (
                  <tr key={r} className="border-b">
                    <th className="p-3 text-left">{r}</th>
                    <td className="p-3">
                      {permissionMatrix[r].join(", ") || "Own customer / business records only"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {mode === "reports" && (
        <>
          {!data.reports.length && <Empty title="No review reports" />}
          {data.reports
            .filter((r) => JSON.stringify(r).toLowerCase().includes(search.toLowerCase()))
            .map((r) => (
              <article key={r.id} className="mb-3 space-y-3 rounded-lg border bg-card p-5">
                <div className="flex gap-3">
                  <strong>{r.reason}</strong>
                  <Pill v={r.status} />
                </div>
                <p>{r.reviews?.text}</p>
                <p className="text-sm">Report evidence: {r.evidence || "None supplied"}</p>
                <p className="text-sm">Decision: {r.decision_reason || "Awaiting review"}</p>
                {r.appeal && <p className="text-sm">Appeal: {r.appeal}</p>}
                <div className="flex gap-2">
                  {moderator && ["submitted", "appealed"].includes(r.status) && (
                    <>
                      <Btn
                        disabled={busy || reason.trim().length < 5}
                        onClick={() => run({ action: "report", id: r.id, uphold: true, reason })}
                      >
                        Uphold · hide review
                      </Btn>
                      <Btn
                        variant="outline"
                        disabled={busy || reason.trim().length < 5}
                        onClick={() => run({ action: "report", id: r.id, uphold: false, reason })}
                      >
                        Dismiss report
                      </Btn>
                    </>
                  )}
                  {r.reporter_id === data.userId && ["upheld", "dismissed"].includes(r.status) && (
                    <Btn
                      variant="outline"
                      disabled={busy || reason.trim().length < 10}
                      onClick={() => run({ action: "appeal", id: r.id, reason })}
                    >
                      Submit appeal
                    </Btn>
                  )}
                </div>
              </article>
            ))}
        </>
      )}
      {mode === "audit" && (
        <div className="space-y-3">
          {data.audit
            .filter((a) => JSON.stringify(a).toLowerCase().includes(search.toLowerCase()))
            .map((a) => (
              <article key={a.id} className="rounded-lg border bg-card p-4">
                <h2 className="font-bold">{a.action}</h2>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()} · Actor {a.actor_id ?? "System"} ·
                  Target {a.entity_id ?? a.business_id}
                </p>
                <p className="mt-2 text-sm">{a.note}</p>
                <pre className="mt-2 whitespace-pre-wrap break-all text-xs">
                  {JSON.stringify({ before: a.before_data, after: a.after_data }, null, 2)}
                </pre>
              </article>
            ))}
        </div>
      )}
    </>
  );
}
