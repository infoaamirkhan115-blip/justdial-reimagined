import { z } from "zod";
export const draftSchema = z.object({
  name: z.string().max(100),
  phone: z.string().max(11),
  city: z.string().max(80),
  category: z.string().max(80),
});
const KEY = "justdial-listing-draft-v1";
export function readListingDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!saved || Date.now() - saved.savedAt > 7 * 86400000) {
      clearListingDraft();
      return null;
    }
    const parsed = draftSchema.safeParse(saved.details);
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function saveListingDraft(details: z.infer<typeof draftSchema>) {
  localStorage.setItem(
    KEY,
    JSON.stringify({ details: draftSchema.parse(details), savedAt: Date.now() }),
  );
}
export function clearListingDraft() {
  localStorage.removeItem(KEY);
}
