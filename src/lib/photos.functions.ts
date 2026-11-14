import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { photoRequestSchema, publishedPhotoPaths } from "./photo-access";

/** Public delivery capability: approval checks happen before privileged signing. */
export const getPublishedPhotoUrls = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => photoRequestSchema.parse(input))
  .handler(async ({ data }): Promise<Record<string, string>> => {
    if (!data.paths.length) return {};
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const publicClient = createClient<Database>(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
      global: { fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      } },
    });
    // All reads use anonymous RLS and explicit approval filters, never admin.
    const [photos, logos, offerings] = await Promise.all([
      publicClient.from("businesses").select("status,photos,logo").eq("status", "approved").overlaps("photos", data.paths),
      publicClient.from("businesses").select("status,photos,logo").eq("status", "approved").in("logo", data.paths),
      publicClient.from("business_offerings").select("published,photos,businesses!inner(status)").eq("published", true).eq("businesses.status", "approved").overlaps("photos", data.paths),
    ]);
    // Fail closed: do not sign anything if a permission/read check fails.
    if (photos.error || logos.error || offerings.error) return {};
    const allowed = publishedPhotoPaths(data.paths, [...(photos.data ?? []), ...(logos.data ?? [])], offerings.data ?? []);
    if (!allowed.length) return {};
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: signed, error } = await supabaseAdmin.storage.from("business-photos").createSignedUrls(allowed, 3600);
    if (error) return {};
    // Server connection URLs can be private in drafts; return browser-facing URLs.
    const browserOrigin = new URL(import.meta.env["VITE_SUPABASE_URL"]).origin;
    return Object.fromEntries((signed ?? []).flatMap(item => {
      if (!item.path || !allowed.includes(item.path) || !item.signedUrl) return [];
      const url = new URL(item.signedUrl);
      return [[item.path, `${browserOrigin}${url.pathname}${url.search}`]];
    }));
  });