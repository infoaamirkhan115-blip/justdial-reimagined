import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "search_businesses",
  title: "Search local businesses",
  description:
    "Find approved businesses in an exact city, optionally filtering business name, category slug and locality; returns at most 20 records per page.",
  inputSchema: {
    city: z.string().trim().min(1).max(100).describe("Exact city name, for example Noida."),
    name: z
      .string()
      .trim()
      .max(100)
      .optional()
      .describe("Optional text contained in the business name."),
    category: z.string().max(100).optional().describe("Optional exact category slug."),
    locality: z.string().max(100).optional().describe("Optional exact locality name."),
    page: z.number().int().min(1).max(100).default(1).describe("Results page, starting at 1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ city, name, category, locality, page }, ctx) => {
    const client = supabaseForUser(ctx);
    let query = client
      .from("businesses")
      .select("id,name,category,city,area,address,phone,website", { count: "exact" })
      .eq("status", "approved")
      .is("archived_at", null)
      .eq("city", city);
    if (name) query = query.ilike("name", `%${name.replace(/[\\%_]/g, "\\$&")}%`);
    if (category) query = query.eq("category", category);
    if (locality) query = query.eq("area", locality);
    const { data, count, error } = await query
      .order("name")
      .order("id")
      .range((page - 1) * 20, page * 20 - 1)
      .abortSignal(ctx.signal);
    if (error) throw new ToolError("Couldn't load businesses. Try again.");
    const businesses = (data ?? []).map((row) => ({ ...row, path: `/business/${row.id}` }));
    return {
      content: [
        { type: "text", text: JSON.stringify({ city, page, total: count ?? 0, businesses }) },
      ],
      structuredContent: { city, page, total: count ?? 0, businesses },
    };
  },
});
