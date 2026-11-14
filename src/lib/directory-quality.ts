import { z } from "zod";
import { isBusinessPhone } from "./business-phone";

export const categoryFieldSchema = z.object({ key: z.string().regex(/^[a-z][a-z0-9_]*$/), label: z.string().min(1).max(100), type: z.enum(["text", "number", "url", "select"]), required: z.boolean().optional(), filter: z.boolean().optional(), options: z.array(z.string()).optional() });
export type CategoryField = z.infer<typeof categoryFieldSchema>;
export const categorySchema = z.object({ id: z.string().uuid().optional(), parent_id: z.string().uuid().nullable(), slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/), legacy_slug: z.string().default(""), name: z.string().trim().min(1).max(120), icon: z.string().max(60), description: z.string().max(2000), group_name: z.string().max(80), aliases: z.array(z.string().max(80)).max(100), fields: z.array(categoryFieldSchema).max(40), cta_label: z.string().min(1).max(80), position: z.number().int(), active: z.boolean(), public_visible: z.boolean() });
export const placeholderContent = (text: string) => /lorem ipsum|placeholder|development instructions|I[’']ll add product|both dashboards|TODO:|test listing|dummy business|insert description|as an AI/i.test(text);
export type QualityBusiness = { id: string; name: string; city: string; area: string; address: string; pincode: string; phone: string; email: string; photos: string[]; description: string; hours: string; attributes: unknown; updated_at: string; verified?: boolean };
export type QualityIssue = { kind: string; severity: "low" | "medium" | "high"; fields: string[]; summary: string };
export function qualityIssues(b: QualityBusiness, fields: CategoryField[] = [], cities: string[] = [], now = Date.now()): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const add = (kind: string, severity: QualityIssue["severity"], affected: string[], summary: string) => issues.push({ kind, severity, fields: affected, summary });
  const foreignCity = cities.find(c => c.toLowerCase() !== b.city.toLowerCase() && new RegExp(`\\b${c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(b.address));
  const addressPin = b.address.match(/\b[1-9]\d{5}\b/)?.[0];
  if (foreignCity || (addressPin && b.pincode && addressPin !== b.pincode)) add("location_conflict", "high", ["city", "area", "pincode", "address"], "Address and selected location disagree. Confirm the correct physical location; do not guess.");
  if (!isBusinessPhone(b.phone) && !b.email) add("missing_contact", "high", ["phone", "email"], "Add a confirmed contact number or email.");
  if (!b.photos.length) add("missing_photos", "medium", ["photos"], "Add genuine business photographs.");
  const attrs = b.attributes && typeof b.attributes === "object" ? b.attributes as Record<string, unknown> : {};
  const missing = fields.filter(f => f.required && (attrs[f.key] === undefined || attrs[f.key] === ""));
  if (missing.length) add("missing_attributes", "medium", missing.map(f => f.key), `Complete category details: ${missing.map(f => f.label).join(", ")}.`);
  if (!b.hours || /unknown|not provided|contact|confirm/i.test(b.hours)) add("unknown_hours", "low", ["hours"], "Confirm opening hours or keep availability unknown.");
  else add("unstructured_hours", "low", ["hours"], "Convert confirmed opening hours to a structured schedule.");
  if (placeholderContent(`${b.name} ${b.description}`)) add("placeholder", "high", ["name", "description"], "Remove development instructions and placeholder content using verified facts.");
  if (now - new Date(b.updated_at).getTime() > 180 * 86400000) add("stale", "low", ["updated_at"], "Reconfirm details; last update is more than 180 days old.");
  return issues;
}
export function completeness(b: QualityBusiness, fields: CategoryField[] = []) {
  const checks = [Boolean(b.name), Boolean(b.address && b.city && b.area), isBusinessPhone(b.phone) || Boolean(b.email), Boolean(b.photos.length), Boolean(b.description) && !placeholderContent(b.description), Boolean(b.hours), ...fields.filter(f => f.required).map(f => Boolean((b.attributes as Record<string, unknown> | null)?.[f.key]))];
  return Math.round(checks.filter(Boolean).length / checks.length * 100);
}
export function duplicateCandidates(b: Pick<QualityBusiness, "name" | "phone" | "city" | "id">, all: Pick<QualityBusiness, "name" | "phone" | "city" | "id">[]) {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  return all.filter(x => x.id !== b.id && ((norm(x.name) === norm(b.name) && x.city === b.city) || (b.phone.replace(/\D/g, "").length >= 10 && x.phone.replace(/\D/g, "").slice(-10) === b.phone.replace(/\D/g, "").slice(-10))));
}
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = [], cell = "", quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { row.push(cell); cell = ""; } else if (c === '\n' && !quoted) { row.push(cell.replace(/\r$/, "")); if (row.some(Boolean)) rows.push(row); row = []; cell = ""; } else cell += c; }
  if (quoted) throw new Error("CSV has an unterminated quoted field");
  row.push(cell.replace(/\r$/, "")); if (row.some(Boolean)) rows.push(row); return rows;
}
export const importRowSchema = z.object({ name: z.string().trim().min(2).max(120), category: z.string().min(1), city: z.string().min(1), area: z.string().min(1), address: z.string().min(1), phone: z.string().refine(isBusinessPhone, "Valid contact number required"), pincode: z.string().regex(/^$|^[1-9]\d{5}$/).default(""), website: z.string().url(), description: z.string().max(10000).refine(t => !placeholderContent(t), "Placeholder content cannot publish").default(""), source_url: z.string().url() });
export type ImportRow = z.infer<typeof importRowSchema>;