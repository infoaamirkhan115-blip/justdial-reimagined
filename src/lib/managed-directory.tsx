import { createContext, useContext, type ReactNode } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES, CITIES, type Category } from "@/data/catalog";
import type { Tables } from "@/integrations/supabase/types";
import { z } from "zod";
import { categoryFieldSchema, type CategoryField } from "./directory-quality";
export type ManagedCategory = Category & {
  id?: string;
  fields: CategoryField[];
  aliases: string[];
  cta_label: string;
  canonicalSlug: string;
  description: string;
};
export const fetchDirectoryDefinitions = async () => {
  const [c, l] = await Promise.all([
    supabase.from("directory_categories").select("*").order("position"),
    supabase.from("directory_locations").select("*").order("name"),
  ]);
  if (c.error || l.error) throw new Error("Directory definitions unavailable");
  return { categories: c.data, locations: l.data };
};
export const directoryDefinitionsQ = queryOptions({
  queryKey: ["directory-definitions"],
  queryFn: fetchDirectoryDefinitions,
  staleTime: 30000,
});
export function mapCategories(rows: Tables<"directory_categories">[]): ManagedCategory[] {
  return rows
    .filter((c) => !c.parent_id)
    .map((c) => {
      const fields = z.array(categoryFieldSchema).safeParse(c.fields);
      return {
        id: c.id,
        slug: c.legacy_slug || c.slug,
        canonicalSlug: c.slug,
        name: c.name,
        icon: c.icon,
        group: c.group_name,
        subs: rows.filter((s) => s.parent_id === c.id).map((s) => s.name),
        fields: fields.success ? fields.data : [],
        aliases: c.aliases,
        cta_label: c.cta_label,
        description: c.description,
      };
    });
}
const fallback = CATEGORIES.map((c) => ({
  ...c,
  fields: [],
  aliases: [],
  cta_label: "Send enquiry",
  canonicalSlug: c.slug,
  description: "",
}));
const Ctx = createContext<{
  categories: ManagedCategory[];
  cities: string[];
  locations: Tables<"directory_locations">[];
}>({ categories: fallback, cities: [...CITIES], locations: [] });
export function DirectoryDefinitionsProvider({ children }: { children: ReactNode }) {
  const q = useQuery(directoryDefinitionsQ);
  return (
    <Ctx.Provider
      value={{
        categories: q.data ? mapCategories(q.data.categories) : fallback,
        cities: q.data
          ? q.data.locations.filter((l) => l.kind === "city").map((l) => l.name)
          : [...CITIES],
        locations: q.data?.locations ?? [],
      }}
    >
      {children}
    </Ctx.Provider>
  );
}
export const useDirectoryDefinitions = () => useContext(Ctx);
