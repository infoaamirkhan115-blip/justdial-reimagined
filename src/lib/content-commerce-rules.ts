import { z } from "zod";

export const contentKinds = ["home_section", "banner", "faq", "testimonial", "contact", "page", "navigation", "footer", "location_page", "redirect"] as const;
export const contentSchema = z.object({
  key: z.string().trim().regex(/^[a-z0-9][a-z0-9-]{1,99}$/),
  kind: z.enum(contentKinds), title: z.string().trim().min(2).max(180),
  body: z.string().max(20000), city: z.string().max(100), category: z.string().max(100),
  locality: z.string().max(100), source: z.string().max(1000), href: z.string().max(1000),
  image: z.string().max(1000), position: z.number().int().min(0).max(1000),
  demo: z.boolean(), approval: z.boolean(),
});
export type ContentPayload = z.infer<typeof contentSchema>;
export function sectionLabelValid(title: string, city: string, category: string) {
  const label = title.toLowerCase();
  return (!city || label.includes(city.toLowerCase())) && (!category || label.includes(category.replaceAll("-", " ").toLowerCase()));
}
export function periodActive(status: string, starts: string, ends: string, now = Date.now()) {
  return status === "active" && Date.parse(starts) <= now && now < Date.parse(ends);
}
export function safeContentLink(value: string) {
  return !value || (/^\/(?!\/)/.test(value) && !/[\\\u0000-\u001f]/.test(value)) || /^https:\/\//.test(value) || /^(mailto:|tel:)/.test(value);
}
export function indexableLocation(body: string, count: number) { return body.trim().length >= 300 && count >= 3; }