import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";
import { createClient } from "@supabase/supabase-js";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const editorialRedirects = createMiddleware().server(async ({ request, next }) => {
  const path = new URL(request.url).pathname;
  if (request.method !== "GET" || path.startsWith("/_") || path.startsWith("/api") || path.startsWith("/admin") || path.startsWith("/dashboard") || path.includes(".")) return next();
  const url=process.env["SUPABASE_URL"],key=process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return next();
  const s=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(key.startsWith("sb_")&&h.get("Authorization")===`Bearer ${key}`)h.delete("Authorization");h.set("apikey",key);return fetch(input,{...init,headers:h});}}});
  const r=await s.rpc("resolve_site_redirect",{path});
  if(r.error) throw new Error("Could not resolve editorial redirects");
  if(typeof r.data==="string" && /^\/(?!\/)/.test(r.data) && !/[\\\u0000-\u001f]/.test(r.data) && r.data!==path) return new Response(null,{status:301,headers:{Location:r.data}});
  return next();
});

// requestMiddleware runs on every request; functionMiddleware only on server functions, where
// client sendContext is unvalidated input. Append to these arrays, never replace them.
// Enabling Lovable Cloud adds functionMiddleware: [attachSupabaseAuth], the bearer token that
// requireSupabaseAuth server functions need. Add it by hand only if Lovable Cloud or a
// user-managed Supabase project is connected, no middleware here sets Authorization, and the
// project did not intentionally replace it.
export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [errorMiddleware, csrfMiddleware, editorialRedirects],
}));
