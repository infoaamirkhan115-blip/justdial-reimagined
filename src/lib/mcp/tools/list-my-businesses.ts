import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_my_businesses",
  title: "List my business listings",
  description: "Read only the authenticated caller's own listings and approval states, including drafts; never returns another owner's listings or internal staff notes.",
  inputSchema: { page: z.number().int().min(1).max(100).default(1).describe("Results page of 20 listings, starting at 1.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ page }, ctx) => {
    const owner = ctx.getUserId();
    if (!owner) throw new ToolError("Sign in to read your listings.");
    const { data, count, error } = await supabaseForUser(ctx).from("businesses")
      .select("id,name,category,city,area,status", { count: "exact" }).eq("owner_id", owner)
      .order("id").range((page - 1) * 20, page * 20 - 1).abortSignal(ctx.signal);
    if (error) throw new ToolError("Couldn't load your listings. Try again.");
    const listings = (data ?? []).map((row) => ({ ...row }));
    return { content: [{ type: "text", text: JSON.stringify({ page, total: count ?? 0, listings }) }], structuredContent: { page, total: count ?? 0, listings } };
  },
});