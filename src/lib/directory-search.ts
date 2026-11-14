import { getCategory, type Business } from "@/data/catalog";

export const PAGE_SIZE = 10;
const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const synonyms = [ ["gypsum ceiling", "false ceiling", "pop ceiling", "ceiling installation"], ["ac repair", "air conditioner repair", "air conditioning"], ["packers movers", "moving services", "relocation"], ["dentist", "dentists", "dental"] ];
export function matchingTerms(query: string) {
  const q = normalize(query);
  return [...new Set([q, ...synonyms.filter(group => group.includes(q)).flat()])];
}
export function directoryResults(list: Business[], input: { q?: string; city: string; locality?: string; verified?: boolean; rated?: boolean; sort?: string; page?: number }) {
  const terms = matchingTerms(input.q ?? "");
  const matches = (s: string) => terms.some(term => normalize(s).includes(term));
  const rows = list.filter(b => b.city === input.city && (!input.locality || normalize(b.area) === normalize(input.locality)) && (!input.verified || b.verified) && (!input.rated || (b.reviews > 0 && b.rating >= 4.5))).flatMap(b => {
    const offerings = (b.offeringTitles ?? []).filter(matches);
    const text = [b.name, b.category, getCategory(b.category)?.name ?? "", b.sub, b.area, ...b.tags, ...b.services.map(s => s.name)];
    if (input.q?.trim() && !offerings.length && !text.some(matches)) return [];
    return [{ ...b, matchedOfferings: input.q?.trim() ? offerings : [] }];
  }).sort((a,b) => (input.sort === "Rating" ? (b.reviews ? b.rating : -1) - (a.reviews ? a.rating : -1) : input.sort === "Popular" ? b.reviews - a.reviews : Number(b.sponsored)-Number(a.sponsored)) || a.name.localeCompare(b.name));
  const pages = Math.max(1,Math.ceil(rows.length/PAGE_SIZE));
  const page = Math.min(pages, Math.max(1, input.page ?? 1));
  return { total: rows.length, pages, page, results: rows.slice((page-1)*PAGE_SIZE,page*PAGE_SIZE) };
}
export function similarBusinesses(list: Business[], b: Business) {
  return list.filter(x => x.id !== b.id && x.category === b.category && x.city === b.city);
}