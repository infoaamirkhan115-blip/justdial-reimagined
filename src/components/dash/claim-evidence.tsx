import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { trustAction } from "@/lib/trust.functions";
export function ClaimEvidence({
  id,
  userId,
  paths,
}: {
  id: string;
  userId: string;
  paths: string[];
}) {
  const save = useServerFn(trustAction),
    qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  return (
    <label className="grid gap-2 text-sm font-bold">
      Add requested private evidence
      <input
        aria-label="Add requested private evidence"
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        disabled={busy || paths.length >= 8}
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setBusy(true);
          try {
            if (
              f.size > 5 * 1024 * 1024 ||
              !["image/jpeg", "image/png", "application/pdf"].includes(f.type)
            )
              throw new Error("Use JPG, PNG or PDF under 5 MB");
            const path = `${userId}/${crypto.randomUUID()}.${f.type === "application/pdf" ? "pdf" : f.type === "image/png" ? "png" : "jpg"}`;
            const r = await supabase.storage.from("trust-evidence").upload(path, f);
            if (r.error) throw r.error;
            await save({ data: { action: "evidence", id, paths: [...paths, path] } });
            await qc.invalidateQueries({ queryKey: ["trust"] });
            toast.success("Private evidence added");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Evidence upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy && <span role="status">Saving private evidence…</span>}
    </label>
  );
}
