import { z } from "zod";

export const photoRequestSchema = z.object({
  paths: z.array(z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.[a-z0-9]+$/).max(180)).max(100),
});

/** Only requested paths explicitly attached to public records may be signed. */
export function publishedPhotoPaths(
  requested: string[],
  businesses: { status: string; photos: string[]; logo: string | null }[],
  offerings: { published: boolean; photos: string[]; businesses: { status: string } }[],
) {
  const allowed = new Set<string>();
  for (const business of businesses) {
    if (business.status !== "approved") continue;
    business.photos.forEach(path => allowed.add(path));
    if (business.logo) allowed.add(business.logo);
  }
  for (const offering of offerings) {
    if (!offering.published || offering.businesses.status !== "approved") continue;
    offering.photos.forEach(path => allowed.add(path));
  }
  return [...new Set(requested)].filter(path => allowed.has(path));
}