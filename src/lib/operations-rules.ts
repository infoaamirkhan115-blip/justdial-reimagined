import { z } from "zod";
export const supportTopics = [
  "incorrect listing",
  "ownership",
  "lead quality",
  "reviews",
  "account access",
  "billing",
  "general help",
] as const;
export const ticketSchema = z.object({
  name: z.string().trim().min(2).max(150),
  email: z.string().trim().email().max(254),
  topic: z.enum(supportTopics),
  description: z.string().trim().min(10).max(5000),
  business_id: z.string().uuid().optional(),
  lead_id: z.string().uuid().optional(),
  claim_id: z.string().uuid().optional(),
  payment_reference: z.string().max(150).optional(),
});
export const filterSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  city: z.string().max(100).optional(),
  category: z.string().max(100).optional(),
  assignee: z.string().uuid().optional(),
});
export type OperationsFilters = z.infer<typeof filterSchema>;
export function safeAttribution(value: string | null) {
  return value && /^[a-zA-Z0-9 _.-]{1,80}$/.test(value) ? value : "";
}
export function safeSearchTerm(value: string) {
  return value.length <= 100 && !/@|\d{6}/.test(value) ? value.trim() : "";
}
export function overdue(deadline: string | null, status: string, now = Date.now()) {
  return Boolean(
    deadline &&
    new Date(deadline).getTime() < now &&
    !["resolved", "closed", "won", "lost"].includes(status),
  );
}
export const metricDefinitions: Record<string, string> = {
  business_view: "Business page views, not unique visitors.",
  offering_view: "Published offering details opened.",
  call_click: "Call-link clicks; not connected calls.",
  whatsapp_click: "WhatsApp-link clicks; not delivered messages.",
  saved_enquiries: "Enquiries saved successfully, including assigned requirements.",
  response_minutes: "Average minutes from enquiry creation to the first recorded vendor response.",
  quotations: "Leads with a quotation recorded as shared; delivery is not verified.",
  reported_won: "Owner/staff-reported wins; not verified revenue.",
  reported_lost: "Owner/staff-reported lost opportunities.",
};
