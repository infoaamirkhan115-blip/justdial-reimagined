# Justdial Redesign — Local Discovery Platform

## Business model (what we're designing for)
Justdial is India's local search engine: users find businesses (restaurants, doctors, plumbers, salons, hotels), read ratings/reviews, call or enquire. Revenue comes from businesses paying for premium listings, top placement and leads. So the design must make search fast for users and make listings look trustworthy (verified badges, ratings, "Get Best Price" lead buttons) for paying businesses.

## Visual direction
- Warm, confident "Indian street-market meets modern utility" feel: deep ink navy, saffron/marigold accent, cream background, fresh green for "Open now"/verified.
- Typography: Bricolage Grotesque (headings) + Manrope (body). No purple gradients, no Inter.
- Bold oversized search, rounded cards, subtle grain, generous whitespace, mobile-first.

## Pages
1. Home (/) — city selector + big search ("What are you looking for?"), quick category grid (icons), trending searches chips, "Popular near you" carousels (restaurants, doctors, home services), B2B/wholesale strip, "List your business free" banner, app download, trust stats, footer with city links.
2. Search results (/search) — sticky filter bar (rating, open now, verified, distance, sort), listing cards with photo, rating, reviews count, address, tags, Call / WhatsApp / Enquire buttons, sponsored badge; map placeholder on desktop.
3. Business detail (/business/$id) — gallery, name, rating, verified, timings, actions, services/menu, reviews, similar businesses, sticky enquiry form.
4. Category page (/category/$slug) — subcategories + top listings.
5. List your business (/free-listing) — value prop for merchants, plans (Free / Premium / Platinum), lead form.

## Data
Realistic mock data (businesses, categories, cities) in a local file; no backend. Enquiry forms show a success toast only.

## Technical details
- TanStack routes for each page with unique head() metadata; update root title.
- Design tokens in styles.css (oklch), fonts via link in __root.
- Generate a few images (hero, category/business photos) into src/assets.
- shadcn-style components, sonner Toaster in root.
