import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Btn } from "@/components/site/ui";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "" }),
  head: () => ({ meta: [
    { title: "Connect an assistant — Justdial Neighborhood Navigator" },
    { name: "description", content: "Review and approve secure assistant access to your Justdial account." },
    { property: "og:title", content: "Connect an assistant — Justdial Neighborhood Navigator" },
    { property: "og:description", content: "Control assistant access without bypassing your account permissions." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection request is missing its authorization ID. Start the connection again from your assistant.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error("Couldn't check your account. Please try again.");
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("This connection request is invalid.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw new Error("This connection request has expired or couldn't be loaded. Start the connection again from your assistant.");
    if (!data) throw new Error("This connection request is unavailable.");
    if ("redirect_url" in data) throw redirect({ href: data.redirect_url });
    return data;
  },
  pendingComponent: () => <main className="container-page py-16" role="status">Loading connection request…</main>,
  errorComponent: ({ error, reset }) => <main className="container-page max-w-xl py-16"><h1 className="text-2xl font-bold">Couldn't load this connection</h1><p role="alert" className="my-4 text-muted-foreground">{error.message}</p><Btn onClick={reset} variant="outline">Try again</Btn></main>,
  component: ConsentPage,
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = approve
        ? await supabase.auth.oauth.approveAuthorization(authorization_id)
        : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error) throw new Error(approve ? "Approval failed. Please try again." : "Cancellation failed. Please try again.");
      if (!result.data?.redirect_url) throw new Error("The connection didn't return a destination. Please try again.");
      window.location.assign(result.data.redirect_url);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Couldn't complete this connection. Please try again.");
      setBusy(false);
    }
  }
  const scopeLabels: Record<string, string> = { openid: "Identify your account", email: "Share your email address", profile: "Share your basic profile" };
  return <main className="container-page max-w-2xl py-12">
    <ShieldCheck className="size-10 text-primary" />
    <h1 className="mt-5 break-words text-3xl font-extrabold">Connect {details.client.name} to Justdial Neighborhood Navigator</h1>
    <div className="my-6 flex flex-wrap items-center justify-between gap-3 border-y py-4"><span className="break-all text-sm">{details.user.email}</span><Btn variant="outline" disabled={busy} onClick={() => { sessionStorage.setItem("postAuth", location.pathname + location.search + location.hash); void signOut(); }}>Switch account</Btn></div>
    <p>This lets {details.client.name} use this app as you.</p>
    <p className="mt-2 break-all text-sm text-muted-foreground">Client return address: {details.redirect_uri}</p>
    <ul className="my-6 list-disc space-y-2 pl-5">{details.scope.split(/\s+/).filter(Boolean).map((scope) => <li key={scope}>{scopeLabels[scope] ?? `Additional permission requested: ${scope}`}</li>)}<li>Search approved local businesses and read published products and services</li><li>Read your own business listings and approval states</li></ul>
    <p className="text-sm text-muted-foreground">This does not bypass your account permissions. No editing, payments, sending enquiries, moderation or private evidence access is granted.</p>
    {error && <p role="alert" className="mt-4 text-destructive">{error}</p>}
    <div className="mt-8 flex flex-wrap gap-3"><Btn disabled={busy} onClick={() => void decide(true)}>{busy ? "Please wait…" : "Approve connection"}</Btn><Btn variant="outline" disabled={busy} onClick={() => void decide(false)}>Cancel connection</Btn></div>
  </main>;
}