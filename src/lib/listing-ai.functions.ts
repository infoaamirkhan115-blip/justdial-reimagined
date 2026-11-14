import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { LISTING_AI_INSTRUCTIONS, listingAiSchema, listingAiResultSchema, type ListingAiResult } from "./listing-ai-schema";

type Result = { result: ListingAiResult; error: null } | { result: null; error: string };

export const generateListingProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(listingAiSchema)
  .handler(async ({ data }): Promise<Result> => {
    const { generateResponse, GatewayError } = await import("@lovable.dev/ai-gateway");
    try {
      const response = await generateResponse({
        model: "openai/gpt-6-astra",
        reasoning: { effort: "low" },
        instructions: LISTING_AI_INSTRUCTIONS,
        input: [{ role: "user", content: `Generate JSON for these owner-provided listing details:\n${JSON.stringify(data)}` }],
        text: { format: {
          type: "json_schema", name: "business_profile", strict: true,
          schema: {
            type: "object", additionalProperties: false, required: ["description", "suggestions"],
            properties: {
              description: { type: "string" },
              suggestions: { type: "array", items: {
                type: "object", additionalProperties: false, required: ["title", "action", "priority"],
                properties: { title: { type: "string" }, action: { type: "string" }, priority: { type: "string", enum: ["high", "medium", "low"] } },
              } },
            },
          },
        } },
      });
      const messages = response.output.filter((item) => item.type === "message");
      if (messages.some((item) => item.content.some((part) => part.type === "refusal"))) {
        return { result: null, error: "AI couldn't help with these details. Please review the content before trying again." };
      }
      if (response.status !== "completed") return { result: null, error: "AI couldn't finish this draft. Your listing details are unchanged." };
      const text = messages.flatMap((item) => item.content.flatMap((part) => part.type === "output_text" ? [part.text] : [])).join("");
      const parsed = listingAiResultSchema.safeParse(JSON.parse(text));
      if (!parsed.success) return { result: null, error: "AI returned an unusable draft. Your listing details are unchanged." };
      return { result: parsed.data, error: null };
    } catch (error) {
      if (error instanceof GatewayError) {
        console.error("Listing AI failed", { code: error.code, outcome: error.outcome, ids: error.ids });
        if (error.code === "payment_required") return { result: null, error: "AI credits are unavailable. The app owner needs to add AI credits." };
        if (error.code === "rate_limited") return { result: null, error: "AI is busy. Please wait before generating another draft." };
        if (error.code === "permission_denied") return { result: null, error: "Workspace settings are blocking this AI model. The app owner needs to review AI access." };
      } else console.error("Listing AI response could not be processed");
      return { result: null, error: "AI couldn't generate your profile. Your details are unchanged; you can continue editing manually." };
    }
  });