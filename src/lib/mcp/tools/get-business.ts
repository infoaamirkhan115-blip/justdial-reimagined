import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "get_business",
  title: "Read business details",
  description: "Read an approved business and its published products or services without exposing internal notes or private photo paths.",
  inputSchema: { business_id: z.string().uuid().describe("Business ID returned by search_businesses.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ business_id }, ctx) => {
    const client = supabaseForUser(ctx);
    const { data, error } = await client.from("businesses")
      .select("id,name,category,city,area,address,description,phone,whatsapp,email,website")
      .eq("id", business_id).eq("status", "approved").is("archived_at", null).maybeSingle().abortSignal(ctx.signal);
    if (error) throw new ToolError("Couldn't load this business. Try again.");
    if (!data) throw new ToolError("This approved business is unavailable.");
    const offerings = await client.from("business_offerings").select("id,name,kind,description,price,price_mode")
      .eq("business_id", business_id).eq("published", true).order("name").limit(50).abortSignal(ctx.signal);
    if (offerings.error) throw new ToolError("Couldn't load the business catalogue. Try again.");
    const business = { ...data, offerings: (offerings.data ?? []).map((row) => ({ ...row })) };
    return { content: [{ type: "text", text: JSON.stringify(business) }], structuredContent: { business } };
  },
});