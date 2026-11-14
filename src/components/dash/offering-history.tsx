import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
export function OfferingHistory({ id }: { id: string }) {
  const query = useQuery({
    queryKey: ["offering-history", id],
    queryFn: async () => {
      const r = await supabase
        .from("offering_revisions")
        .select("*")
        .eq("offering_id", id)
        .order("created_at", { ascending: false });
      if (r.error) throw r.error;
      return r.data;
    },
  });
  if (query.isPending) return <p role="status">Loading revision history…</p>;
  if (query.error) return <p role="alert">Could not load revisions.</p>;
  if (!query.data.length) return <p>No revisions recorded yet.</p>;
  return (
    <div className="space-y-4">
      {query.data.map((r) => {
        const before = (r.before_data ?? {}) as Record<string, unknown>,
          after = r.after_data as Record<string, unknown>;
        return (
          <section key={r.id} className="border-t pt-3">
            <h3 className="text-sm font-bold">{new Date(r.created_at).toLocaleString()}</h3>
            {Object.keys(after)
              .filter(
                (k) => k !== "updated_at" && JSON.stringify(before[k]) !== JSON.stringify(after[k]),
              )
              .map((k) => (
                <div key={k} className="mt-2 text-xs">
                  <p className="font-bold">{k}</p>
                  <p className="break-all text-muted-foreground">
                    Old: {JSON.stringify(before[k]) ?? "—"}
                  </p>
                  <p className="break-all">New: {JSON.stringify(after[k])}</p>
                </div>
              ))}
          </section>
        );
      })}
    </div>
  );
}
