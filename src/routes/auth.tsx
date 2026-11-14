import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Btn } from "@/components/site/ui";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { oauthReturnPath } from "@/lib/oauth-return-path";

type S = { redirect?: string | undefined; next?: string | undefined };
export const Route = createFileRoute("/auth")({
  staticData: { sitemap: false },
  validateSearch: (s: Record<string, unknown>): S => ({
    redirect: typeof s["redirect"] === "string" ? oauthReturnPath(s["redirect"]) : undefined,
    next: typeof s["next"] === "string" ? oauthReturnPath(s["next"]) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Justdial for Business" },
      {
        name: "description",
        content: "Sign in or create an account to manage your business listing, leads and reviews.",
      },
      { property: "og:title", content: "Sign in — Justdial for Business" },
      { property: "og:description", content: "Manage your listing, leads and reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function GoogleIcon() {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
    >
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

function AuthPage() {
  const { redirect, next } = Route.useSearch();
  const dest = next ?? redirect ?? "/dashboard";
  const { user } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) {
      const p = sessionStorage.getItem("postAuth");
      sessionStorage.removeItem("postAuth");
      const target = next ?? redirect ?? (p ? oauthReturnPath(p) : dest);
      nav({ href: target, replace: true });
    }
  }, [user, dest, next, redirect, nav]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) toast.error(error.message);
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: pw,
        options: {
          emailRedirectTo: new URL(dest, window.location.origin).href,
          data: { full_name: name },
        },
      });
      if (error) toast.error(error.message);
      else if (!data.session)
        toast.success("Check your email to confirm your account, then sign in.");
    }
    setBusy(false);
  };
  const google = async () => {
    sessionStorage.setItem("postAuth", dest);
    const r = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: new URL(
        dest.startsWith("/.lovable/oauth/consent")
          ? dest
          : "/auth?next=" + encodeURIComponent(dest),
        window.location.origin,
      ).href,
    });
    if (r.error) toast.error("Google sign-in failed. Please try again.");
  };

  const field = "h-11 w-full rounded-xl border border-input bg-background px-3 text-sm";
  return (
    <div className="container-page grid min-h-[75vh] place-items-center py-10">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[2rem] border bg-card shadow-lift md:grid-cols-2">
        <div className="grain relative hidden bg-gradient-ink p-10 text-ink-foreground md:block">
          <p className="text-xs font-bold uppercase tracking-[.18em] text-primary">
            Justdial for Business
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight">
            Your listing, leads and reviews — in one place.
          </h1>
          <ul className="mt-8 space-y-3 text-sm text-ink-muted">
            <li>• Add and edit your business listings</li>
            <li>• Reply to customer reviews</li>
            <li>• Track every enquiry and close more deals</li>
          </ul>
        </div>
        <div className="p-8">
          <div className="flex rounded-xl bg-muted p-1 text-sm font-bold">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn("flex-1 rounded-lg py-2", mode === m && "bg-card shadow-soft")}
              >
                {m === "in" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>
          <button
            onClick={google}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2.5 rounded-xl border border-[#747775] bg-[#FFFFFF] px-3 text-sm font-medium text-[#1F1F1F]"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or with email
            <span className="h-px flex-1 bg-border" />
          </div>
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                aria-label="Full name"
                className={field}
              />
            )}
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              aria-label="Email"
              className={field}
            />
            <input
              required
              type="password"
              minLength={6}
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Password"
              aria-label="Password"
              className={field}
            />
            <Btn type="submit" disabled={busy} className="w-full">
              {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
            </Btn>
          </form>
        </div>
      </div>
    </div>
  );
}
