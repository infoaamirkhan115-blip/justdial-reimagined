import { useState } from "react";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  ClipboardCheck,
  Download,
  History,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { Btn } from "@/components/site/ui";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Empty, PageTitle, Pill, inputCls } from "./shell";
import {
  categorySchema,
  importRowSchema,
  parseCsv,
  duplicateCandidates,
  type CategoryField,
} from "@/lib/directory-quality";
import {
  managementData,
  saveCategory,
  saveLocation,
  refreshQuality,
  updateQualityIssue,
  reviewChange,
  stageImport,
  importAction,
  mergeBusinesses,
  saveStaffNote,
} from "@/lib/directory-management.functions";
import type { Tables } from "@/integrations/supabase/types";

export const managementQ = queryOptions({
  queryKey: ["admin", "directory-management"],
  queryFn: () => managementData(),
});
type Mode = "categories" | "locations" | "quality" | "imports" | "changes";
const emptyCategory = {
  parent_id: null as string | null,
  slug: "",
  legacy_slug: "",
  name: "",
  icon: "Building2",
  group_name: "",
  description: "",
  aliases: [] as string[],
  fields: [] as CategoryField[],
  cta_label: "Send enquiry",
  position: 0,
  active: true,
  public_visible: true,
};
export function DirectoryManager({ mode }: { mode: Mode }) {
  const { data } = useSuspenseQuery(managementQ);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [cat, setCat] = useState<typeof emptyCategory & { id?: string }>();
  const [loc, setLoc] = useState<Partial<Tables<"directory_locations">>>();
  const [issue, setIssue] = useState<Tables<"directory_quality_issues">>();
  const [change, setChange] = useState<Tables<"listing_change_requests">>();
  const [feedback, setFeedback] = useState("");
  const [history, setHistory] = useState<string>();
  const [csv, setCsv] = useState<string[][]>([]);
  const [filename, setFilename] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [batch, setBatch] = useState<Tables<"directory_import_batches">>();
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [merging, setMerging] = useState(false);
  const [staff, setStaff] = useState<{
    business_id: string;
    note: string;
    ownership_status: "unverified" | "review" | "confirmed";
    ownership_evidence: string;
  }>();
  const categorySave = useServerFn(saveCategory),
    locationSave = useServerFn(saveLocation),
    refresh = useServerFn(refreshQuality),
    updateIssue = useServerFn(updateQualityIssue),
    review = useServerFn(reviewChange),
    stage = useServerFn(stageImport),
    apply = useServerFn(importAction),
    merge = useServerFn(mergeBusinesses),
    noteSave = useServerFn(saveStaffNote);
  const run = async (action: () => Promise<unknown>, message: string, close?: () => void) => {
    setBusy(true);
    try {
      await action();
      await qc.invalidateQueries();
      toast.success(message);
      close?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    } finally {
      setBusy(false);
    }
  };
  const title = {
    categories: "Categories & attributes",
    locations: "Locations & branches",
    quality: "Listing quality centre",
    imports: "Imports & duplicates",
    changes: "Listing change review",
  }[mode];
  const importKeys = [
    "name",
    "category",
    "city",
    "area",
    "address",
    "phone",
    "pincode",
    "website",
    "description",
    "source_url",
  ];
  const mapped = csv
    .slice(1)
    .map((row) =>
      Object.fromEntries(importKeys.map((key) => [key, row[Number(mapping[key] ?? -1)] ?? ""])),
    );
  const errors = (row: Record<string, unknown>) => {
    const result = importRowSchema.safeParse(row);
    const e = result.success
      ? []
      : result.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`);
    if (
      !data.categories.some(
        (c) => c.active && (c.slug === row["category"] || c.legacy_slug === row["category"]),
      )
    )
      e.push("Unknown category");
    if (!data.locations.some((l) => l.kind === "city" && l.active && l.name === row["city"]))
      e.push("Unknown city");
    return e;
  };
  const selectedSource = data.businesses.find((b) => b.id === source),
    selectedTarget = data.businesses.find((b) => b.id === target);
  return (
    <>
      <PageTitle
        title={title}
        action={
          mode === "categories" ? (
            <Btn onClick={() => setCat({ ...emptyCategory })}>
              <Plus className="size-4" />
              Add category
            </Btn>
          ) : mode === "locations" ? (
            <Btn
              onClick={() =>
                setLoc({
                  kind: "city",
                  name: "",
                  active: true,
                  verified: false,
                  source_url: "",
                  parent_id: null,
                })
              }
            >
              <Plus className="size-4" />
              Add location
            </Btn>
          ) : mode === "quality" ? (
            <Btn disabled={busy} onClick={() => run(() => refresh(), "Quality check saved")}>
              <RefreshCw className="size-4" />
              Recheck listings
            </Btn>
          ) : undefined
        }
      />
      <div className="mb-5 flex flex-wrap gap-3">
        <input
          aria-label={`Search ${title}`}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search records"
          className={`${inputCls} sm:max-w-80`}
        />
        {["quality", "changes"].includes(mode) && (
          <select
            aria-label="Filter status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={`${inputCls} sm:max-w-48`}
          >
            <option value="all">All statuses</option>
            {(mode === "quality"
              ? ["open", "in_progress", "resolved", "dismissed"]
              : ["review", "approved", "rejected"]
            ).map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
        {mode === "quality" && (
          <select
            aria-label="Filter severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
            className={`${inputCls} sm:max-w-40`}
          >
            <option value="all">All severities</option>
            {["high", "medium", "low"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
      {mode === "categories" && (
        <div className="space-y-3">
          {[...data.categories]
            .sort((a, b) => {
              const ap = data.categories.find((c) => c.id === a.parent_id) ?? a;
              const bp = data.categories.find((c) => c.id === b.parent_id) ?? b;
              return (
                ap.position - bp.position ||
                ap.name.localeCompare(bp.name) ||
                Number(Boolean(a.parent_id)) - Number(Boolean(b.parent_id)) ||
                a.position - b.position
              );
            })
            .filter((c) =>
              `${c.name} ${c.slug} ${c.aliases.join(" ")}`.toLowerCase().includes(q.toLowerCase()),
            )
            .map((c) => (
              <article
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
              >
                <div>
                  <h2 className="font-bold">
                    {c.parent_id && <span className="text-muted-foreground">↳ </span>}
                    {c.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    /{c.slug} · {c.active && c.public_visible ? "Public" : "Hidden"} ·{" "}
                    {Array.isArray(c.fields) ? c.fields.length : 0} fields
                  </p>
                </div>
                <Btn
                  variant="outline"
                  onClick={() =>
                    setCat({ ...c, fields: categorySchema.shape.fields.parse(c.fields) })
                  }
                >
                  <Pencil className="size-4" />
                  Edit
                </Btn>
              </article>
            ))}
        </div>
      )}
      {mode === "locations" && (
        <>
          <div className="space-y-3">
            {data.locations
              .filter((l) => `${l.name} ${l.kind}`.toLowerCase().includes(q.toLowerCase()))
              .map((l) => (
                <article
                  key={l.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4"
                >
                  <div>
                    <h2 className="font-bold">{l.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {l.kind} ·{" "}
                      {data.locations.find((p) => p.id === l.parent_id)?.name ??
                        "Relationship unconfirmed"}{" "}
                      · {l.verified ? "Source verified" : "Unverified"}
                    </p>
                  </div>
                  <Btn variant="outline" onClick={() => setLoc(l)}>
                    <MapPin className="size-4" />
                    Edit
                  </Btn>
                </article>
              ))}
          </div>
          <h2 className="mt-8 text-xl font-bold">Business organizations</h2>
          {data.organizations.length ? (
            data.organizations.map((o) => (
              <p key={o.id} className="mt-2">
                {o.name} · {data.businesses.filter((b) => b.organization_id === o.id).length}{" "}
                branches
              </p>
            ))
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              No organization relationships recorded.
            </p>
          )}
        </>
      )}
      {mode === "quality" && (
        <>
          <div className="mb-4 flex flex-wrap gap-3 text-sm">
            {["high", "medium", "low"].map((s) => (
              <span key={s} className="rounded-lg border bg-card px-3 py-2">
                {
                  data.issues.filter(
                    (i) => i.severity === s && ["open", "in_progress"].includes(i.status),
                  ).length
                }{" "}
                {s} priority
              </span>
            ))}
          </div>
          {!data.issues.length && (
            <Empty
              title="No quality issues recorded"
              action={
                <Btn disabled={busy} onClick={() => run(() => refresh(), "Quality check saved")}>
                  Check listings
                </Btn>
              }
            />
          )}
          <div className="space-y-3">
            {data.issues
              .filter(
                (i) =>
                  (status === "all" || i.status === status) &&
                  (severity === "all" || i.severity === severity) &&
                  `${i.summary} ${i.kind} ${data.businesses.find((b) => b.id === i.business_id)?.name}`
                    .toLowerCase()
                    .includes(q.toLowerCase()),
              )
              .map((i) => (
                <article key={i.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTriangle className="size-4 text-coral" />
                    <h2 className="font-bold">
                      {data.businesses.find((b) => b.id === i.business_id)?.name}
                    </h2>
                    <Pill v={i.severity} />
                    <Pill v={i.status} />
                  </div>
                  <p className="mt-2 text-sm">{i.summary}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {i.fields.join(", ")} ·{" "}
                    {data.profiles.find((p) => p.id === i.assignee)?.full_name ?? "Unassigned"}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Btn variant="outline" onClick={() => setIssue(i)}>
                      Review issue
                    </Btn>
                    <Btn variant="ghost" onClick={() => setHistory(i.id)}>
                      <History className="size-4" />
                      History
                    </Btn>
                    <Btn
                      variant="ghost"
                      onClick={() => {
                        const n = data.notes.find((n) => n.business_id === i.business_id);
                        setStaff({
                          business_id: i.business_id,
                          note: n?.note ?? "",
                          ownership_status:
                            n?.ownership_status === "confirmed"
                              ? "confirmed"
                              : n?.ownership_status === "review"
                                ? "review"
                                : "unverified",
                          ownership_evidence: n?.ownership_evidence ?? "",
                        });
                      }}
                    >
                      Private notes
                    </Btn>
                  </div>
                </article>
              ))}
          </div>
        </>
      )}
      {mode === "changes" && (
        <div className="space-y-3">
          {data.changes
            .filter(
              (r) =>
                (status === "all" || r.status === status) &&
                `${data.businesses.find((b) => b.id === r.business_id)?.name} ${r.feedback}`
                  .toLowerCase()
                  .includes(q.toLowerCase()),
            )
            .map((r) => (
              <article
                key={r.id}
                className="flex flex-wrap justify-between gap-3 rounded-xl border bg-card p-4"
              >
                <div>
                  <h2 className="font-bold">
                    {data.businesses.find((b) => b.id === r.business_id)?.name}
                  </h2>
                  <Pill v={r.status} />
                  <p className="mt-1 text-sm">{r.feedback}</p>
                </div>
                <Btn
                  variant="outline"
                  onClick={() => {
                    setChange(r);
                    setFeedback(r.feedback);
                  }}
                >
                  <ClipboardCheck className="size-4" />
                  Compare changes
                </Btn>
              </article>
            ))}
          {!data.changes.length && <Empty title="No listing changes awaiting review" />}
        </div>
      )}
      {mode === "imports" && (
        <>
          <section className="space-y-4 border-b pb-6">
            <div className="flex flex-wrap gap-3">
              <Btn
                variant="outline"
                onClick={() => {
                  const url = URL.createObjectURL(
                    new Blob([importKeys.join(",") + "\n"], { type: "text/csv" }),
                  );
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "justdial-import-template.csv";
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="size-4" />
                Download template
              </Btn>
              <label className="flex items-center gap-2 text-sm font-bold">
                <Upload className="size-4" />
                CSV file
                <input
                  aria-label="Import CSV"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      if (f.size > 2_000_000) throw new Error("CSV must be under 2 MB");
                      const rows = parseCsv(await f.text());
                      if (rows.length > 501) throw new Error("Maximum 500 rows per batch");
                      setCsv(rows);
                      setFilename(f.name);
                      setMapping(
                        Object.fromEntries(
                          importKeys.map((k) => [k, String(rows[0]?.indexOf(k) ?? -1)]),
                        ),
                      );
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Invalid CSV");
                    }
                  }}
                  className="max-w-64 font-normal"
                />
              </label>
            </div>
            {csv.length > 0 && (
              <>
                <h2 className="font-bold">Field mapping · {filename}</h2>
                <div className="grid gap-3 sm:grid-cols-3">
                  {importKeys.map((k) => (
                    <label className="text-sm" key={k}>
                      {k}
                      <select
                        aria-label={`Map ${k}`}
                        value={mapping[k] ?? "-1"}
                        onChange={(e) => setMapping({ ...mapping, [k]: e.target.value })}
                        className={inputCls}
                      >
                        <option value="-1">Not mapped</option>
                        {csv[0]?.map((h, i) => (
                          <option key={i} value={i}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
                <ImportPreview rows={mapped} errors={errors} businesses={data.businesses} />
                <Btn
                  disabled={busy || !mapped.length}
                  onClick={() =>
                    run(
                      () => stage({ data: { filename, mapping, rows: mapped } }),
                      "Batch staged; not published",
                      () => setCsv([]),
                    )
                  }
                >
                  Save staged batch
                </Btn>
              </>
            )}
          </section>
          <h2 className="mt-6 text-xl font-bold">Batch history</h2>
          <div className="mt-3 space-y-3">
            {data.imports.map((b) => (
              <article
                className="flex flex-wrap justify-between gap-3 rounded-xl border bg-card p-4"
                key={b.id}
              >
                <div>
                  <h3 className="font-bold">{b.filename}</h3>
                  <Pill v={b.status} />
                  <p className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleString()} ·{" "}
                    {Array.isArray(b.rows) ? b.rows.length : 0} rows
                  </p>
                </div>
                <Btn variant="outline" onClick={() => setBatch(b)}>
                  Review batch
                </Btn>
              </article>
            ))}
          </div>
          <section className="mt-8 space-y-4 border-t pt-6">
            <h2 className="text-xl font-bold">Duplicate review & merge</h2>
            <p className="text-sm text-muted-foreground">
              Shared phone numbers are candidates only. The survivor keeps its field values; linked
              activity moves after confirmation.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Archive duplicate", value: source, change: setSource },
                { label: "Keep listing", value: target, change: setTarget },
              ].map((x) => (
                <label className="text-sm font-bold" key={x.label}>
                  {x.label}
                  <select
                    aria-label={x.label}
                    className={inputCls}
                    value={x.value}
                    onChange={(e) => x.change(e.target.value)}
                  >
                    <option value="">Select listing</option>
                    {data.businesses
                      .filter((b) => !b.archived_at)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} · {b.city}
                        </option>
                      ))}
                  </select>
                </label>
              ))}
            </div>
            <Btn
              variant="outline"
              disabled={!source || !target || source === target}
              onClick={() => setMerging(true)}
            >
              Preview merge
            </Btn>
          </section>
        </>
      )}
      <Dialog open={Boolean(cat)} onOpenChange={(o) => !o && setCat(undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{cat?.id ? "Edit category" : "Add category"}</DialogTitle>
          </DialogHeader>
          {cat && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () => categorySave({ data: categorySchema.parse(cat) }),
                  "Category saved",
                  () => setCat(undefined),
                );
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {(["name", "slug", "icon", "group_name", "cta_label"] as const).map((k) => (
                  <label className="text-sm font-bold" key={k}>
                    {k.replace(/_/g, " ")}
                    <input
                      required
                      aria-label={`Category ${k}`}
                      value={cat[k]}
                      onChange={(e) => setCat({ ...cat, [k]: e.target.value })}
                      className={inputCls}
                    />
                  </label>
                ))}
                <label className="text-sm font-bold">
                  Parent category
                  <select
                    aria-label="Parent category"
                    className={inputCls}
                    value={cat.parent_id ?? ""}
                    onChange={(e) => setCat({ ...cat, parent_id: e.target.value || null })}
                  >
                    <option value="">Top level</option>
                    {data.categories
                      .filter((c) => c.id !== cat.id)
                      .map((c) => (
                        <option value={c.id} key={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </label>
                <label className="text-sm font-bold">
                  Ordering
                  <input
                    type="number"
                    value={cat.position}
                    onChange={(e) => setCat({ ...cat, position: Number(e.target.value) })}
                    className={inputCls}
                  />
                </label>
                <label className="text-sm font-bold">
                  Search aliases
                  <input
                    value={cat.aliases.join(", ")}
                    onChange={(e) =>
                      setCat({ ...cat, aliases: e.target.value.split(",").map((s) => s.trim()) })
                    }
                    className={inputCls}
                  />
                </label>
              </div>
              <label className="grid gap-1 text-sm font-bold">
                Description
                <textarea
                  value={cat.description}
                  onChange={(e) => setCat({ ...cat, description: e.target.value })}
                  className="rounded-xl border bg-background p-3"
                />
              </label>
              <div className="flex gap-4">
                <label>
                  <input
                    type="checkbox"
                    checked={cat.active}
                    onChange={(e) => setCat({ ...cat, active: e.target.checked })}
                  />{" "}
                  Active
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={cat.public_visible}
                    onChange={(e) => setCat({ ...cat, public_visible: e.target.checked })}
                  />{" "}
                  Public
                </label>
              </div>
              <h3 className="font-bold">Category fields & filters</h3>
              {cat.fields.map((f, i) => (
                <div key={i} className="space-y-2 border-t pt-3">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <input
                      aria-label="Field key"
                      placeholder="field_key"
                      value={f.key}
                      className={inputCls}
                      onChange={(e) =>
                        setCat({
                          ...cat,
                          fields: cat.fields.map((v, n) =>
                            n === i ? { ...v, key: e.target.value } : v,
                          ),
                        })
                      }
                    />
                    <input
                      aria-label="Field label"
                      placeholder="Label"
                      value={f.label}
                      className={inputCls}
                      onChange={(e) =>
                        setCat({
                          ...cat,
                          fields: cat.fields.map((v, n) =>
                            n === i ? { ...v, label: e.target.value } : v,
                          ),
                        })
                      }
                    />
                    <select
                      aria-label="Field type"
                      value={f.type}
                      className={inputCls}
                      onChange={(e) =>
                        setCat({
                          ...cat,
                          fields: cat.fields.map((v, n) =>
                            n === i ? { ...v, type: e.target.value as CategoryField["type"] } : v,
                          ),
                        })
                      }
                    >
                      {["text", "number", "url", "select"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <input
                    aria-label="Field options"
                    placeholder="Allowed choices, separated by commas"
                    value={f.options?.join(", ") ?? ""}
                    className={inputCls}
                    onChange={(e) =>
                      setCat({
                        ...cat,
                        fields: cat.fields.map((v, n) =>
                          n === i
                            ? {
                                ...v,
                                options: e.target.value
                                  .split(",")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : v,
                        ),
                      })
                    }
                  />
                  <div className="flex gap-4 text-sm">
                    <label>
                      <input
                        type="checkbox"
                        checked={f.required ?? false}
                        onChange={(e) =>
                          setCat({
                            ...cat,
                            fields: cat.fields.map((v, n) =>
                              n === i ? { ...v, required: e.target.checked } : v,
                            ),
                          })
                        }
                      />{" "}
                      Required
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={f.filter ?? false}
                        onChange={(e) =>
                          setCat({
                            ...cat,
                            fields: cat.fields.map((v, n) =>
                              n === i ? { ...v, filter: e.target.checked } : v,
                            ),
                          })
                        }
                      />{" "}
                      Public filter
                    </label>
                    <Btn
                      type="button"
                      variant="ghost"
                      onClick={() =>
                        setCat({ ...cat, fields: cat.fields.filter((_, n) => n !== i) })
                      }
                    >
                      Remove
                    </Btn>
                  </div>
                </div>
              ))}
              <Btn
                type="button"
                variant="outline"
                onClick={() =>
                  setCat({ ...cat, fields: [...cat.fields, { key: "", label: "", type: "text" }] })
                }
              >
                <Plus className="size-4" />
                Add field
              </Btn>
              <div className="flex justify-end">
                <Btn disabled={busy} type="submit">
                  Save category
                </Btn>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(loc)} onOpenChange={(o) => !o && setLoc(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage location</DialogTitle>
          </DialogHeader>
          {loc && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () =>
                    locationSave({
                      data: {
                        ...(loc.id ? { id: loc.id } : {}),
                        name: loc.name ?? "",
                        kind:
                          loc.kind === "locality"
                            ? "locality"
                            : loc.kind === "pincode"
                              ? "pincode"
                              : "city",
                        parent_id: loc.parent_id ?? null,
                        active: loc.active ?? true,
                        verified: loc.verified ?? false,
                        source_url: loc.source_url ?? "",
                      },
                    }),
                  "Location saved",
                  () => setLoc(undefined),
                );
              }}
            >
              <label className="grid gap-1">
                Kind
                <select
                  value={loc.kind}
                  onChange={(e) => setLoc({ ...loc, kind: e.target.value, parent_id: null })}
                  className={inputCls}
                >
                  {["city", "locality", "pincode"].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Name
                <input
                  required
                  value={loc.name ?? ""}
                  onChange={(e) => setLoc({ ...loc, name: e.target.value })}
                  className={inputCls}
                />
              </label>
              {loc.kind !== "city" && (
                <label className="grid gap-1">
                  City relationship
                  <select
                    value={loc.parent_id ?? ""}
                    onChange={(e) => setLoc({ ...loc, parent_id: e.target.value || null })}
                    className={inputCls}
                  >
                    <option value="">Unconfirmed</option>
                    {data.locations
                      .filter((l) => l.kind === "city")
                      .map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name}
                        </option>
                      ))}
                  </select>
                </label>
              )}
              <label className="grid gap-1">
                Source URL
                <input
                  type="url"
                  value={loc.source_url ?? ""}
                  onChange={(e) => setLoc({ ...loc, source_url: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={loc.verified ?? false}
                  onChange={(e) => setLoc({ ...loc, verified: e.target.checked })}
                />{" "}
                Source verified
              </label>
              <label className="block">
                <input
                  type="checkbox"
                  checked={loc.active ?? true}
                  onChange={(e) => setLoc({ ...loc, active: e.target.checked })}
                />{" "}
                Active
              </label>
              <Btn disabled={busy}>Save location</Btn>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(issue)} onOpenChange={(o) => !o && setIssue(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review quality issue</DialogTitle>
          </DialogHeader>
          {issue && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () =>
                    updateIssue({
                      data: {
                        id: issue.id,
                        status: issue.status as "open" | "in_progress" | "resolved" | "dismissed",
                        notes: issue.notes,
                        assignee: issue.assignee,
                      },
                    }),
                  "Issue updated",
                  () => setIssue(undefined),
                );
              }}
            >
              <p>{issue.summary}</p>
              <label className="grid gap-1">
                Status
                <select
                  className={inputCls}
                  value={issue.status}
                  onChange={(e) => setIssue({ ...issue, status: e.target.value })}
                >
                  {["open", "in_progress", "resolved", "dismissed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Assignee
                <select
                  className={inputCls}
                  value={issue.assignee ?? ""}
                  onChange={(e) => setIssue({ ...issue, assignee: e.target.value || null })}
                >
                  <option value="">Unassigned</option>
                  {data.profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name || p.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Private notes / resolution reason
                <textarea
                  required
                  value={issue.notes}
                  onChange={(e) => setIssue({ ...issue, notes: e.target.value })}
                  className="rounded-xl border bg-background p-3"
                />
              </label>
              <Btn disabled={busy}>Save issue</Btn>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(change)} onOpenChange={(o) => !o && setChange(undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Old / new listing details</DialogTitle>
          </DialogHeader>
          {change && (
            <>
              <Diff before={change.before_data} after={change.proposed_data} />
              {change.status === "review" && (
                <>
                  <label className="grid gap-1 text-sm">
                    Feedback to owner
                    <textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="rounded-xl border bg-background p-3"
                    />
                  </label>
                  <div className="flex gap-3">
                    <Btn
                      disabled={busy || feedback.trim().length < 3}
                      onClick={() =>
                        run(
                          () => review({ data: { id: change.id, approve: true, feedback } }),
                          "Changes approved",
                          () => setChange(undefined),
                        )
                      }
                    >
                      Approve changes
                    </Btn>
                    <Btn
                      variant="outline"
                      disabled={busy || feedback.trim().length < 3}
                      onClick={() =>
                        run(
                          () => review({ data: { id: change.id, approve: false, feedback } }),
                          "Changes rejected",
                          () => setChange(undefined),
                        )
                      }
                    >
                      Reject
                    </Btn>
                  </div>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(history)} onOpenChange={(o) => !o && setHistory(undefined)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Resolution history</DialogTitle>
          </DialogHeader>
          {data.audit
            .filter((a) => a.entity_id === history)
            .map((a) => (
              <div key={a.id} className="border-t py-3">
                <Pill v={a.action} />
                <p className="mt-1 text-sm">{a.note}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleString()}
                </p>
              </div>
            ))}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(staff)} onOpenChange={(o) => !o && setStaff(undefined)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Private staff notes & ownership</DialogTitle>
          </DialogHeader>
          {staff && (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                run(
                  () => noteSave({ data: staff }),
                  "Private notes saved",
                  () => setStaff(undefined),
                );
              }}
            >
              <label className="grid gap-1">
                Staff note
                <textarea
                  value={staff.note}
                  onChange={(e) => setStaff({ ...staff, note: e.target.value })}
                  className="rounded-xl border bg-background p-3"
                />
              </label>
              <label className="grid gap-1">
                Ownership status
                <select
                  value={staff.ownership_status}
                  onChange={(e) =>
                    setStaff({
                      ...staff,
                      ownership_status: e.target.value as typeof staff.ownership_status,
                    })
                  }
                  className={inputCls}
                >
                  {["unverified", "review", "confirmed"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1">
                Private evidence
                <textarea
                  value={staff.ownership_evidence}
                  onChange={(e) => setStaff({ ...staff, ownership_evidence: e.target.value })}
                  className="rounded-xl border bg-background p-3"
                />
              </label>
              <Btn disabled={busy}>Save private notes</Btn>
            </form>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={Boolean(batch)} onOpenChange={(o) => !o && setBatch(undefined)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Review import · {batch?.filename}</DialogTitle>
          </DialogHeader>
          {batch && (
            <>
              <ImportPreview
                rows={Array.isArray(batch.rows) ? (batch.rows as Record<string, string>[]) : []}
                errors={errors}
                businesses={data.businesses}
              />
              {batch.status === "staged" && (
                <Btn
                  disabled={
                    busy ||
                    !Array.isArray(batch.rows) ||
                    (batch.rows as Record<string, string>[]).some((r) => errors(r).length)
                  }
                  onClick={() => {
                    if (confirm("Approve publication of these validated rows?"))
                      run(
                        () => apply({ data: { id: batch.id, reverse: false } }),
                        "Import published",
                        () => setBatch(undefined),
                      );
                  }}
                >
                  Approve publication
                </Btn>
              )}
              {batch.status === "applied" && (
                <Btn
                  variant="outline"
                  disabled={busy}
                  onClick={() => {
                    if (
                      confirm(
                        "Archive imported records if no later changes or linked activity exist?",
                      )
                    )
                      run(
                        () => apply({ data: { id: batch.id, reverse: true } }),
                        "Import reversed by recoverable archive",
                        () => setBatch(undefined),
                      );
                  }}
                >
                  Reverse import
                </Btn>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={merging} onOpenChange={setMerging}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Confirm duplicate merge</DialogTitle>
          </DialogHeader>
          {selectedSource && selectedTarget && (
            <>
              <p className="text-sm">
                Archive <strong>{selectedSource.name}</strong>; keep{" "}
                <strong>{selectedTarget.name}</strong>. Reviews, leads, offerings, saved-list links
                and redirects are preserved. The survivor’s fields remain unchanged.
              </p>
              <Diff before={selectedSource} after={selectedTarget} />
              <label className="grid gap-1">
                Reason
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="rounded-xl border bg-background p-3"
                />
              </label>
              <Btn
                disabled={busy || reason.trim().length < 5}
                onClick={() => {
                  if (confirm("Merge these distinct records and preserve all linked activity?"))
                    run(
                      () => merge({ data: { source, target, reason } }),
                      "Merge saved with redirect and audit",
                      () => {
                        setMerging(false);
                        setSource("");
                      },
                    );
                }}
              >
                Confirm merge
              </Btn>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
function Diff({ before, after }: { before: unknown; after: unknown }) {
  const old = (before ?? {}) as Record<string, unknown>,
    next = (after ?? {}) as Record<string, unknown>;
  return (
    <div className="space-y-3">
      {Object.keys(next)
        .filter(
          (k) =>
            !["updated_at", "admin_note", "owner_id"].includes(k) &&
            JSON.stringify(old[k]) !== JSON.stringify(next[k]),
        )
        .map((k) => (
          <div key={k} className="border-t pt-3">
            <h3 className="text-sm font-bold">{k}</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              <p className="break-all rounded-lg bg-muted p-2 text-xs">
                Old: {JSON.stringify(old[k])}
              </p>
              <p className="break-all rounded-lg bg-saffron-soft p-2 text-xs">
                New: {JSON.stringify(next[k])}
              </p>
            </div>
          </div>
        ))}
    </div>
  );
}
function ImportPreview({
  rows,
  errors,
  businesses,
}: {
  rows: Record<string, string>[];
  errors: (r: Record<string, unknown>) => string[];
  businesses: Tables<"businesses">[];
}) {
  return (
    <div className="max-h-96 space-y-2 overflow-auto">
      {rows.map((r, i) => {
        const e = errors(r);
        const duplicates = duplicateCandidates(
          {
            id: `import-${i}`,
            name: r["name"] ?? "",
            phone: r["phone"] ?? "",
            city: r["city"] ?? "",
          },
          businesses,
        );
        return (
          <article className="rounded-lg border p-3 text-sm" key={i}>
            <p className="font-bold">
              Row {i + 1}: {r["name"] || "Missing name"} · {r["city"]}
            </p>
            <p className="break-all text-xs text-muted-foreground">
              {r["address"]} · source: {r["source_url"]}
            </p>
            {e.length ? (
              <p className="mt-1 text-destructive">{e.join("; ")}</p>
            ) : (
              <p className="mt-1 text-success">Valid · awaiting approval</p>
            )}
            {duplicates.length > 0 && (
              <p className="mt-1 text-coral">
                Possible duplicates: {duplicates.map((d) => d.name).join(", ")} · no automatic merge
              </p>
            )}
          </article>
        );
      })}
    </div>
  );
}
