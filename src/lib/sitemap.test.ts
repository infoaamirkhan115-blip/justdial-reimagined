import { describe, it, expect } from "vitest";
import { sitemapXML, isSitemapRouteIncluded } from "./sitemap";
describe("sitemap safety",()=>{
  it("omits unknown publication timestamps",()=>expect(sitemapXML("https://justdial-neighborhood-navigator.lovable.app",[{path:"/business/real-slug"}])).not.toContain("lastmod"));
  it("excludes undecided MCP routes",()=>expect(isSitemapRouteIncluded(undefined)).toBe(false));
  it("rejects search/filter URLs",()=>expect(()=>sitemapXML("https://justdial-neighborhood-navigator.lovable.app",[{path:"/search?q=private"}])).toThrow());
});