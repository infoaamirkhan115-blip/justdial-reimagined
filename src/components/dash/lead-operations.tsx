import { useState } from "react";
import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Send, Clock } from "lucide-react";
import {
  leadOpsData,
  postRequirement,
  assignRequirement,
  leadAction,
} from "@/lib/operations.functions";
import { useDirectoryDefinitions } from "@/lib/managed-directory";
import { useAuth } from "@/lib/auth";
import { Btn } from "@/components/site/ui";
import { PageTitle, Pill, inputCls } from "./shell";
import { overdue } from "@/lib/operations-rules";
export const leadOpsQ = (owner = false, page = 1, requirement?: string, lead?: string) =>
  queryOptions({
    queryKey: ["lead-operations", owner, page, requirement, lead],
    queryFn: () => leadOpsData({ data: { owner, page, requirement, lead } }),
  });
export function RequirementForm({ onSaved }: { onSaved?: () => void }) {
  const { user } = useAuth();
  const { categories, cities } = useDirectoryDefinitions();
  const post = useServerFn(postRequirement);
  const [busy, setBusy] = useState(false);
  const [ref, setRef] = useState("");
  const [error, setError] = useState("");
  if (!user)
    return (
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Post a buying requirement</h2>
        <Link to="/auth" className="font-bold underline">
          Sign in to post your requirement
        </Link>
      </div>
    );
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        setBusy(true);
        setError("");
        try {
          const r = await post({
            data: {
              topic: String(f.get("topic")),
              description: String(f.get("description")),
              name: String(f.get("name")),
              phone: String(f.get("phone")),
              city: String(f.get("city")),
              category: String(f.get("category")),
            },
          });
          setRef(r.id);
          form.reset();
          onSaved?.();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save requirement");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="text-xl font-bold">Post a buying requirement</h2>
      {ref && (
        <p role="status" className="rounded-lg bg-success-soft p-3 text-sm">
          Requirement saved · {ref.slice(0, 8)}. Awaiting assignment.
        </p>
      )}
      <label className="block text-sm">
        What do you need?
        <input name="topic" required minLength={3} maxLength={150} className={inputCls} />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          City
          <select name="city" defaultValue="Noida" className={inputCls}>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Category
          <select name="category" className={inputCls}>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Your name
          <input name="name" minLength={2} maxLength={100} required className={inputCls} />
        </label>
        <label className="text-sm">
          Mobile number
          <input
            name="phone"
            inputMode="numeric"
            pattern="[6-9][0-9]{9}"
            maxLength={10}
            required
            className={inputCls}
          />
        </label>
      </div>
      <label className="block text-sm">
        Details
        <textarea
          name="description"
          minLength={10}
          maxLength={3000}
          rows={3}
          required
          className="w-full rounded-lg border bg-background p-3"
        />
      </label>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Btn type="submit" disabled={busy}>
        <Send className="size-4" />
        {busy ? "Saving…" : "Save requirement"}
      </Btn>
    </form>
  );
}
export function LeadOperations({
  owner = false,
  initialRequirement,
  initialLead,
}: {
  owner?: boolean;
  initialRequirement?: string | undefined;
  initialLead?: string | undefined;
}) {
  const [page, setPage] = useState(1);
  const q = useQuery(leadOpsQ(owner, page, initialRequirement, initialLead));
  const qc = useQueryClient();
  const assign = useServerFn(assignRequirement);
  const act = useServerFn(leadAction);
  const [busy, setBusy] = useState(false);
  const save = async (work: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await work();
      await qc.invalidateQueries({ queryKey: ["lead-operations"] });
      await qc.invalidateQueries({ queryKey: ["operations"] });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle title={owner ? "Enquiries & outcomes" : "Requirements & lead operations"} />
      {owner && (
        <section className="mb-8 border-b pb-6">
          <RequirementForm
            onSaved={() => void qc.invalidateQueries({ queryKey: ["lead-operations"] })}
          />
        </section>
      )}
      {q.isPending ? (
        <p>Loading enquiries…</p>
      ) : q.isError ? (
        <div role="alert">
          Could not load operations. <Btn onClick={() => void q.refetch()}>Retry</Btn>
        </div>
      ) : (
        <>
          <h2 className="text-xl font-bold">Buying requirements · {q.data.requirementTotal}</h2>
          <ul className="mt-3 divide-y border-y">
            {q.data.requirements.map((r) => (
              <li key={r.id} className="py-5">
                <h3 className="font-bold">
                  {r.topic} <Pill v={r.status} />
                </h3>
                <p className="text-sm text-muted-foreground">
                  {r.city} · {r.category} · {new Date(r.created_at).toLocaleString()}
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm">{r.description}</p>
                {!owner && (
                  <form
                    className="mt-3 flex flex-wrap gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const d = String(f.get("deadline") ?? "");
                      void save(() =>
                        assign({
                          data: {
                            id: r.id,
                            business: String(f.get("business")),
                            assignee: String(f.get("assignee") ?? "") || null,
                            deadline: d ? new Date(d).toISOString() : null,
                          },
                        }),
                      );
                    }}
                  >
                    <select
                      name="business"
                      aria-label={`Business for ${r.topic}`}
                      required
                      className="h-11 max-w-full rounded-lg border bg-background px-3"
                    >
                      <option value="">Select matching business</option>
                      {q.data.businesses
                        .filter((b) => b.city === r.city && b.category === r.category)
                        .map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                    </select>
                    <select
                      aria-label="Requirement assignee"
                      name="assignee"
                      className="h-11 rounded-lg border bg-background px-3"
                    >
                      <option value="">Unassigned staff</option>
                      {q.data.staff
                        .filter((s) => ["sales", "support", "super_admin"].includes(s.role))
                        .map((s) => (
                          <option key={`${s.user_id}${s.role}`} value={s.user_id}>
                            {s.role} · {s.user_id.slice(0, 8)}
                          </option>
                        ))}
                    </select>
                    <input
                      aria-label="Vendor response deadline"
                      name="deadline"
                      type="datetime-local"
                      className="h-11 max-w-full rounded-lg border bg-background px-3"
                    />
                    <Btn disabled={busy} type="submit">
                      Assign requirement
                    </Btn>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {!q.data.requirements.length && (
            <p className="py-5 text-sm text-muted-foreground">No requirements on this page.</p>
          )}
          <h2 className="mt-8 text-xl font-bold">Saved enquiries · {q.data.total}</h2>
          <ul className="mt-3 divide-y border-y">
            {q.data.leads.map((l) => (
              <li key={l.id} className="py-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">
                      {l.businesses.name} · {l.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(l.created_at).toLocaleString()} · {l.businesses.city}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap break-words text-sm">{l.message}</p>
                  </div>
                  <Pill v={l.status} />
                </div>
                {overdue(l.response_due_at, l.status) && !l.first_response_at && (
                  <p className="mt-2 flex items-center gap-2 text-sm text-coral">
                    <Clock className="size-4" />
                    Vendor response overdue
                  </p>
                )}
                <dl className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <div>
                    First recorded response:{" "}
                    {l.first_response_at
                      ? new Date(l.first_response_at).toLocaleString()
                      : "Not recorded"}
                  </div>
                  <div>
                    Quotation shared:{" "}
                    {l.quotation_sent_at
                      ? new Date(l.quotation_sent_at).toLocaleString()
                      : "Not recorded"}
                  </div>
                  <div>Assignee: {l.assignee?.slice(0, 8) ?? "Unassigned"}</div>
                </dl>
                {l.quotation_text && <p className="mt-2 text-sm">Quotation: {l.quotation_text}</p>}
                {l.outcome_reason && (
                  <p className="mt-2 text-sm">Reported outcome: {l.outcome_reason}</p>
                )}
                {!owner && (
                  <form
                    className="mt-4 flex flex-wrap gap-3"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const deadline = String(f.get("deadline") ?? "");
                      void save(() =>
                        act({
                          data: {
                            id: l.id,
                            payload: {
                              action: "assign",
                              assignee: String(f.get("assignee") ?? ""),
                              deadline: deadline ? new Date(deadline).toISOString() : "",
                            },
                          },
                        }),
                      );
                    }}
                  >
                    <select
                      name="assignee"
                      aria-label="Lead assignee"
                      defaultValue={l.assignee ?? ""}
                      className="h-11 rounded-lg border bg-background px-3"
                    >
                      <option value="">Unassigned</option>
                      {q.data.staff
                        .filter((s) => ["sales", "support", "super_admin"].includes(s.role))
                        .map((s) => (
                          <option key={`${s.user_id}${s.role}`} value={s.user_id}>
                            {s.role} · {s.user_id.slice(0, 8)}
                          </option>
                        ))}
                    </select>
                    <input
                      aria-label="Lead response deadline"
                      name="deadline"
                      type="datetime-local"
                      className="h-11 max-w-full rounded-lg border bg-background px-3"
                    />
                    <Btn type="submit" variant="outline" disabled={busy}>
                      Save assignment
                    </Btn>
                  </form>
                )}
                <form
                  className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto]"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    const mode = String(f.get("action"));
                    void save(() =>
                      act({
                        data: {
                          id: l.id,
                          payload: {
                            action:
                              mode === "won" || mode === "lost"
                                ? "outcome"
                                : (mode as "response" | "quote"),
                            body: String(f.get("body")),
                            ...(mode === "won" || mode === "lost" ? { status: mode } : {}),
                          },
                        },
                      }),
                    );
                  }}
                >
                  <select
                    aria-label="Record enquiry action"
                    name="action"
                    className="h-11 rounded-lg border bg-background px-3"
                  >
                    <option value="response">Record first response</option>
                    <option value="quote">Record quotation shared</option>
                    <option value="won">Report won</option>
                    <option value="lost">Report lost</option>
                  </select>
                  <input
                    name="body"
                    aria-label="Response or outcome details"
                    placeholder="Details / reason"
                    required
                    minLength={5}
                    maxLength={2000}
                    className={inputCls}
                  />
                  <Btn type="submit" disabled={busy}>
                    Save action
                  </Btn>
                </form>
              </li>
            ))}
          </ul>
          {!q.data.leads.length && (
            <p className="py-5 text-sm text-muted-foreground">No enquiries on this page.</p>
          )}
          <div className="mt-5 flex justify-between">
            <Btn variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
              Previous
            </Btn>
            <span>Page {page}</span>
            <Btn
              variant="outline"
              disabled={page * 20 >= Math.max(q.data.total, q.data.requirementTotal)}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Btn>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Responses, quotations and won/lost results are recorded by the owner or staff. They do
            not verify message delivery, connected calls or revenue.
          </p>
        </>
      )}
    </>
  );
}
