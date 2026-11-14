import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

function projectUrl() {
  const url = process.env["SUPABASE_URL"] ?? import.meta.env.VITE_SUPABASE_URL;
  if (!url) throw new Error("Database configuration is unavailable.");
  return url;
}
function publishableKey() {
  const direct = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (direct) return direct;
  const dictionary = process.env["SUPABASE_PUBLISHABLE_KEYS"];
  if (dictionary) {
    try {
      const parsed: unknown = JSON.parse(dictionary);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const key = Object.values(parsed).find((value): value is string => typeof value === "string" && value.startsWith("sb_publishable_"));
        if (key) return key;
      }
    } catch { /* Continue to legacy configuration. */ }
  }
  const legacy = process.env["SUPABASE_ANON_KEY"] ?? import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (legacy) return legacy;
  throw new Error("Database configuration is unavailable.");
}

export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token || !ctx.isAuthenticated()) throw new Error("Sign in through the connection authorization flow.");
  return createClient<Database>(projectUrl(), publishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}