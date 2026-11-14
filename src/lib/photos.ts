import { supabase } from "@/integrations/supabase/client";
import { getPublishedPhotoUrls } from "./photos.functions";

export const PHOTO_BUCKET = "business-photos";
export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

/** Upload one image into the owner's folder; returns the stored path. */
export async function uploadPhoto(file: File, ownerId: string) {
  if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded");
  if (file.size > MAX_PHOTO_BYTES) throw new Error("Each photo must be under 5 MB");
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const path = `${ownerId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw error;
  return path;
}

/** Turn stored paths into viewable links (bucket is private, so links are signed). */
export async function photoUrls(paths: string[]): Promise<Record<string, string>> {
  const uniq = [...new Set(paths.filter(Boolean))];
  if (!uniq.length) return {};
  const { data } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(uniq, 3600);
  const urls: Record<string, string> = Object.fromEntries((data ?? []).filter((d) => d.signedUrl && d.path).map((d) => [d.path!, d.signedUrl as string]));
  // Owners/admins keep their private read path; guests use checked public delivery.
  const missing = uniq.filter(path => !urls[path]);
  for (let offset = 0; offset < missing.length; offset += 100) {
    Object.assign(urls, await getPublishedPhotoUrls({ data: { paths: missing.slice(offset, offset + 100) } }));
  }
  return urls;
}
