import { useState } from "react";
import { useQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { LifeBuoy, Send, Lock, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { Btn } from "@/components/site/ui";
import { PageTitle, Pill, inputCls } from "./shell";
import { useAuth } from "@/lib/auth";
import {
  supportData,
  submitTicket,
  submitAccountTicket,
  ticketAction,
} from "@/lib/operations.functions";
import { supportTopics, ticketSchema, overdue } from "@/lib/operations-rules";
export const supportQ = (staff = false, page = 1, status = "", ticket?: string) =>
  queryOptions({
    queryKey: ["support", staff, page, status, ticket],
    queryFn: () =>
      supportData({
        data: {
          staff,
          page,
          status: status && status !== "overdue" ? status : undefined,
          overdue: status === "overdue",
          ticket,
        },
      }),
  });
export function SupportForm({ onSaved }: { onSaved?: (id: string) => void }) {
  const { user } = useAuth();
  const publicSubmit = useServerFn(submitTicket);
  const accountSubmit = useServerFn(submitAccountTicket);
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const f = new FormData(form);
        const data = ticketSchema.safeParse(
          Object.fromEntries([...f.entries()].filter(([, v]) => v !== "")),
        );
        if (!data.success) {
          setError(data.error.issues[0]?.message ?? "Check your details");
          return;
        }
        setBusy(true);
        setError("");
        try {
          const r = await (user ? accountSubmit : publicSubmit)({ data: data.data });
          setReference(r.reference);
          form.reset();
          onSaved?.(r.id);
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not save your request");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <LifeBuoy className="size-5" />
        New support request
      </h2>
      {reference && (
        <div role="status" className="rounded-lg bg-success-soft p-4">
          <p className="font-bold">Request saved · {reference}</p>
          <p className="text-sm">Keep this reference when contacting support.</p>
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          Your name
          <input name="name" required minLength={2} maxLength={150} className={inputCls} />
        </label>
        <label className="text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            defaultValue={user?.email ?? ""}
            className={inputCls}
          />
        </label>
      </div>
      <label className="block text-sm">
        Topic
        <select name="topic" className={inputCls}>
          {supportTopics.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Description
        <textarea
          name="description"
          required
          minLength={10}
          maxLength={5000}
          rows={4}
          className="w-full rounded-lg border bg-background p-3"
        />
      </label>
      <details className="text-sm">
        <summary className="cursor-pointer font-semibold">Linked records (optional)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {[
            ["business_id", "Business ID"],
            ["lead_id", "Lead ID"],
            ["claim_id", "Claim ID"],
            ["payment_reference", "Payment reference"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              <input name={name} className={inputCls} />
            </label>
          ))}
        </div>
      </details>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <Btn type="submit" disabled={busy}>
        <Send className="size-4" />
        {busy ? "Saving…" : "Submit request"}
      </Btn>
      {!user && (
        <p className="text-sm text-muted-foreground">
          <Link to="/auth" className="underline">
            Sign in
          </Link>{" "}
          to keep requests in your account and follow the conversation.
        </p>
      )}
    </form>
  );
}
export function SupportCenter({
  staff = false,
  initialTicket,
}: {
  staff?: boolean;
  initialTicket?: string | undefined;
}) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [ticket, setTicket] = useState(initialTicket);
  const [kind, setKind] = useState<"reply" | "internal">("reply");
  const qc = useQueryClient();
  const action = useServerFn(ticketAction);
  const q = useQuery(supportQ(staff, page, status, ticket));
  const selected = q.data?.selected;
  const [busy, setBusy] = useState(false);
  const save = async (payload: Parameters<typeof action>[0]["data"]["payload"]) => {
    if (!ticket) return;
    setBusy(true);
    try {
      await action({ data: { id: ticket, payload } });
      await qc.invalidateQueries({ queryKey: ["support"] });
      toast.success("Saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <PageTitle
        title={staff ? "Support queue" : "My support tickets"}
        sub={q.data ? `${q.data.total} matching requests` : "Support requests"}
      />
      <div className="mb-6 flex flex-wrap gap-3">
        <select
          aria-label="Ticket status filter"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="h-11 rounded-lg border bg-background px-3"
        >
          <option value="">All statuses</option>
          {[
            "open",
            "in_progress",
            "waiting_requester",
            "escalated",
            "resolved",
            "closed",
            "overdue",
          ].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <Btn variant="outline" onClick={() => setTicket(undefined)}>
          New request
        </Btn>
      </div>
      {q.isPending ? (
        <p>Loading tickets…</p>
      ) : q.isError ? (
        <div role="alert">
          Could not load tickets. <Btn onClick={() => void q.refetch()}>Retry</Btn>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(240px,1fr)_minmax(0,2fr)]">
          <section>
            <ul className="divide-y border-y">
              {q.data.tickets.map((t) => (
                <li key={t.id}>
                  <Btn
                    variant="ghost"
                    className="w-full justify-start rounded-none py-4 text-left"
                    onClick={() => setTicket(t.id)}
                  >
                    <span className="min-w-0">
                      <span className="block font-bold">{t.reference}</span>
                      <span className="block break-words text-sm">
                        {t.topic} · {t.requester_name}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-2">
                        <Pill v={t.status} />
                        {overdue(t.response_due_at, t.status) && (
                          <span className="flex items-center gap-1 text-coral">
                            <Clock className="size-3" />
                            Overdue
                          </span>
                        )}
                      </span>
                    </span>
                  </Btn>
                </li>
              ))}
            </ul>
            {!q.data.tickets.length && (
              <p className="py-6 text-muted-foreground">No matching tickets.</p>
            )}
            <div className="mt-4 flex items-center justify-between">
              <Btn
                aria-label="Previous ticket page"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft className="size-4" />
              </Btn>
              <span>
                {page} / {Math.max(1, Math.ceil(q.data.total / 20))}
              </span>
              <Btn
                aria-label="Next ticket page"
                variant="outline"
                disabled={page * 20 >= q.data.total}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight className="size-4" />
              </Btn>
            </div>
          </section>
          <section className="min-w-0">
            {!ticket ? (
              <SupportForm
                onSaved={(id) => {
                  setTicket(id);
                  void qc.invalidateQueries({ queryKey: ["support"] });
                }}
              />
            ) : !selected ? (
              <p>Ticket unavailable.</p>
            ) : (
              <>
                <h2 className="text-xl font-bold">
                  {selected.reference} · {selected.topic}
                </h2>
                <p className="mt-2 whitespace-pre-wrap break-words">{selected.description}</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Priority: {selected.priority} ·{" "}
                  {selected.response_due_at
                    ? `Deadline: ${new Date(selected.response_due_at).toLocaleString()}`
                    : "No response deadline set"}
                </p>
                {selected.resolution_reason && (
                  <p className="mt-2">Resolution: {selected.resolution_reason}</p>
                )}
                {staff && (
                  <form
                    key={selected.updated_at}
                    className="my-6 grid gap-3 border-y py-4 sm:grid-cols-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      const deadline = String(f.get("deadline") ?? "");
                      void save({
                        action: "update",
                        status: String(f.get("status")) as "open",
                        priority: String(f.get("priority")) as "normal",
                        assignee: String(f.get("assignee") ?? ""),
                        deadline: deadline ? new Date(deadline).toISOString() : "",
                        reason: String(f.get("reason") ?? ""),
                      });
                    }}
                  >
                    <label className="text-sm">
                      Status
                      <select name="status" defaultValue={selected.status} className={inputCls}>
                        {[
                          "open",
                          "in_progress",
                          "waiting_requester",
                          "escalated",
                          "resolved",
                          "closed",
                        ].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      Priority
                      <select name="priority" defaultValue={selected.priority} className={inputCls}>
                        {["low", "normal", "high", "urgent"].map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      Assignee
                      <select
                        name="assignee"
                        defaultValue={selected.assignee ?? ""}
                        className={inputCls}
                      >
                        <option value="">Unassigned</option>
                        {q.data.staff
                          .filter((s) => ["support", "super_admin"].includes(s.role))
                          .map((s) => (
                            <option key={`${s.user_id}${s.role}`} value={s.user_id}>
                              {s.role} · {s.user_id.slice(0, 8)}
                            </option>
                          ))}
                      </select>
                    </label>
                    <label className="text-sm">
                      Response deadline
                      <input
                        name="deadline"
                        type="datetime-local"
                        defaultValue={
                          selected.response_due_at ? selected.response_due_at.slice(0, 16) : ""
                        }
                        className={inputCls}
                      />
                    </label>
                    <label className="text-sm sm:col-span-2">
                      Reason / resolution
                      <input
                        name="reason"
                        defaultValue={selected.resolution_reason}
                        maxLength={2000}
                        className={inputCls}
                      />
                    </label>
                    <Btn disabled={busy} type="submit">
                      Save ticket
                    </Btn>
                  </form>
                )}
                <h3 className="mt-6 font-bold">Conversation & activity</h3>
                <ul className="mt-3 divide-y">
                  {q.data.messages.map((m) => (
                    <li
                      key={m.id}
                      className={`py-3 ${m.kind === "internal" ? "bg-muted px-3" : ""}`}
                    >
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        {m.kind === "internal" && <Lock className="size-3" />}
                        {m.kind} · {new Date(m.created_at).toLocaleString()}
                      </p>
                      <p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p>
                    </li>
                  ))}
                </ul>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    await save({
                      action: kind,
                      body: String(new FormData(form).get("body") ?? ""),
                    });
                  }}
                >
                  {staff && (
                    <select
                      aria-label="Message visibility"
                      value={kind}
                      onChange={(e) => setKind(e.target.value as "reply" | "internal")}
                      className={inputCls}
                    >
                      <option value="reply">Reply to requester</option>
                      <option value="internal">Private staff note</option>
                    </select>
                  )}
                  <textarea
                    aria-label="Message"
                    name="body"
                    required
                    maxLength={5000}
                    rows={3}
                    className="w-full rounded-lg border bg-background p-3"
                  />
                  <Btn disabled={busy} type="submit">
                    <Send className="size-4" />
                    Save {kind === "internal" ? "private note" : "reply"}
                  </Btn>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
