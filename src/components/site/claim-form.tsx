import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { submitClaim } from "@/lib/trust.functions";
import { supabase } from "@/integrations/supabase/client";
import { Btn } from "./ui";
import { inputCls } from "@/components/dash/shell";
export function ClaimForm({ businessId, name }: { businessId: string; name: string }) {
  const { user } = useAuth(),
    submit = useServerFn(submitClaim);
  const [identity, setIdentity] = useState(""),
    [contact, setContact] = useState(""),
    [corrections, setCorrections] = useState(""),
    [paths, setPaths] = useState<string[]>([]),
    [busy, setBusy] = useState(false),
    [saved, setSaved] = useState(false);
  if (!user)
    return (
      <div className="py-8">
        <p className="mb-4">Sign in to claim {name}.</p>
        <Link to="/auth" search={{ redirect: `/claim/${businessId}` }}>
          Sign in to claim this listing
        </Link>
      </div>
    );
  if (saved)
    return (
      <div role="status" className="py-8">
        <h2 className="text-xl font-bold">Claim submitted for review</h2>
        <p className="my-3">Ownership has not changed.</p>
        <Link to="/dashboard/claims">View claim progress</Link>
      </div>
    );
  return (
    <form
      className="max-w-2xl space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          await submit({
            data: {
              business_id: businessId,
              identity_name: identity,
              contact,
              corrections,
              evidence: paths,
            },
          });
          setSaved(true);
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Claim submission failed");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label className="grid gap-2 font-bold">
        Your full name
        <input
          required
          minLength={2}
          maxLength={150}
          value={identity}
          onChange={(e) => setIdentity(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="grid gap-2 font-bold">
        Business contact method
        <input
          required
          minLength={5}
          maxLength={200}
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="grid gap-2 font-bold">
        Requested corrections
        <textarea
          maxLength={4000}
          value={corrections}
          onChange={(e) => setCorrections(e.target.value)}
          className={inputCls}
        />
      </label>
      <label className="grid gap-2 font-bold">
        Private ownership evidence
        <input
          type="file"
          accept="image/jpeg,image/png,application/pdf"
          multiple
          disabled={busy}
          onChange={async (e) => {
            const files = Array.from(e.target.files ?? []);
            setBusy(true);
            try {
              if (files.length + paths.length > 8) throw new Error("Maximum 8 evidence files");
              const added: string[] = [];
              for (const f of files) {
                if (
                  f.size > 5 * 1024 * 1024 ||
                  !["image/jpeg", "image/png", "application/pdf"].includes(f.type)
                )
                  throw new Error("Use JPG, PNG or PDF files under 5 MB");
                const p = `${user.id}/${crypto.randomUUID()}.${f.type === "application/pdf" ? "pdf" : f.type === "image/png" ? "png" : "jpg"}`;
                const r = await supabase.storage.from("trust-evidence").upload(p, f);
                if (r.error) throw r.error;
                added.push(p);
              }
              setPaths([...paths, ...added]);
            } catch (e) {
              toast.error(e instanceof Error ? e.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </label>
      <p className="text-sm text-muted-foreground">
        {paths.length} private files attached. A reviewer will check your evidence and contact
        methods.
      </p>
      <Btn type="submit" disabled={busy}>
        {busy ? "Saving…" : "Submit ownership claim"}
      </Btn>
    </form>
  );
}
