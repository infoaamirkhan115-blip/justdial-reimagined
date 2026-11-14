import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Loader2, Sparkles, Undo2 } from "lucide-react";
import { Btn } from "@/components/site/ui";
import { generateListingProfile } from "@/lib/listing-ai.functions";
import { listingAiSchema, type ListingAiDetails, type ListingAiResult } from "@/lib/listing-ai-schema";

export function ListingAiAssistant({ details, onApply }: { details: Omit<ListingAiDetails, "extraDetails">; onApply: (text: string) => void }) {
  const generate = useServerFn(generateListingProfile);
  const [extraDetails, setExtraDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<ListingAiResult | null>(null);
  const [source, setSource] = useState("");
  const [previous, setPrevious] = useState<string | null>(null);
  const inFlight = useRef(false);
  const currentSource = JSON.stringify({ ...details, extraDetails });
  const stale = result !== null && source !== currentSource;
  const applied = result !== null && details.description === result.description;

  const run = async () => {
    if (inFlight.current) return;
    const parsed = listingAiSchema.safeParse({ ...details, extraDetails });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Review your listing details first"); return; }
    inFlight.current = true;
    setBusy(true); setError("");
    try {
      const response = await generate({ data: parsed.data });
      if (response.error) { setError(response.error); return; }
      setResult(response.result); setSource(currentSource); setPrevious(null);
    } catch { setError("Couldn't connect to AI. Your listing details are unchanged. Please check your sign-in and try again."); }
    finally { inFlight.current = false; setBusy(false); }
  };

  return (
    <div className="space-y-4 sm:col-span-2">
      <label className="block text-sm font-semibold" htmlFor="ai-business-details">Additional business details</label>
      <textarea id="ai-business-details" value={extraDetails} onChange={(e) => setExtraDetails(e.target.value)} maxLength={2000} rows={3} placeholder="Your main services, customers you serve, specialties, and what makes your business different…" className="w-full rounded-xl border border-input bg-background p-3 text-sm" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">AI draft · Review facts before saving</span>
        <Btn type="button" variant="ink" disabled={busy} onClick={run}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          {busy ? "Writing your profile…" : result ? "Regenerate profile" : "Generate profile"}
        </Btn>
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div aria-live="polite" aria-busy={busy}>
        {result && <div className="space-y-5 border-t pt-4">
          <div>
            <h3 className="font-display text-lg font-bold">Suggested description</h3>
            <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed">{result.description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn type="button" disabled={busy || applied} onClick={() => {
                setPrevious(details.description);
                onApply(result.description);
                setSource(JSON.stringify({ ...details, description: result.description, extraDetails }));
              }}><Check className="size-4" />{applied ? "Description applied" : "Use description"}</Btn>
              {previous !== null && applied && <Btn type="button" variant="outline" disabled={busy} onClick={() => {
                onApply(previous); setSource(JSON.stringify({ ...details, description: previous, extraDetails })); setPrevious(null);
              }}><Undo2 className="size-4" />Undo</Btn>}
            </div>
            {stale && <p className="mt-2 text-xs text-coral">Listing details changed since this draft was generated.</p>}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold">Profile improvements</h3>
            <ol className="mt-2 divide-y">
              {result.suggestions.map((suggestion, i) => <li key={`${i}-${suggestion.title}`} className="py-3">
                <div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold">{i + 1}. {suggestion.title}</span><span className="text-xs font-semibold capitalize text-muted-foreground">{suggestion.priority} priority</span></div>
                <p className="mt-1 break-words text-sm text-muted-foreground">{suggestion.action}</p>
              </li>)}
            </ol>
          </div>
        </div>}
      </div>
    </div>
  );
}