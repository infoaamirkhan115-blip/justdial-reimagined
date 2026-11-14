# Phase 2 directory data administration
- [ ] Move categories, hierarchy, attributes, aliases and public visibility into managed records with legacy URL compatibility.
- [ ] Add managed locations, organizations, branches and separate service coverage with reviewable location conflicts.
- [ ] Build persistent listing-quality queue, assignments, notes, history and owner completeness guidance.
- [ ] Add catalogue review states, category specifications, publication validation, preview and revisions.
- [ ] Build staged CSV import, validation, provenance, batch history and explicit publication approval.
- [ ] Add duplicate previews and audited relationship-preserving merges with redirects.
- [ ] Replace routine listing deletion with recoverable archive; review sensitive edits with field differences and separate owner feedback/staff notes.
- [ ] Verify isolated customer/owner/admin journeys, permission denial, existing URLs, and desktop/mobile layouts.

# Phase 1 public directory repair
- [x] Reproduce current issues and inspect existing data, routes, permissions and integrations.
- [x] Repair loading/errors, offering search, location filters, pagination and URL state.
- [x] Correct category recommendations and real Save/Share/Directions/Call/WhatsApp actions.
- [x] Improve catalogue, contextual enquiries, missing-data states and mobile layouts.
- [x] Preserve onboarding drafts through authentication and submission.
- [x] Verify 35 automated tests, targeted lint, public search/pagination, persisted favourites, copy-link sharing, directions, mobile layout, draft restoration/discard, and admin access; latest preview check passed.
- [ ] Verify published offering search and nested offering/enquiry dialogs against a live eligible offering. Blocker: current database has no Gypsum Ceiling offering; its former parent is no longer present. Do not recreate removed production records.
- [ ] Verify enquiry insertion/rate limits, successful listing submission/draft clearing, and cross-owner direct API denial using isolated fixtures. Blocker: an isolated test business and second test-owner session are required; never submit fake enquiries to real listings.

# Product and service module
- [x] Store products/services securely for each business.
- [x] Add shared management and detailed photo/pricing forms to both dashboards.
- [x] Show published products/services on public business listings.
- [x] Test validation, permissions, and signed-in create/edit/public display.

# Listing AI assistant
- [x] Add authenticated AI generation from owner-provided listing details.
- [x] Add description preview, apply/undo, and tailored suggestions in the listing form.
- [x] Test validation and signed-in generation, saving, and public display.
- [x] Add a contextual enquiry popup with current business/service details and photo, following the uploaded reference.

# Real Noida listings
- [x] Verify real Noida businesses against public official sources.
- [x] Replace only original imported samples; preserve owner-created listings.
- [x] Add Noida and correct public city filtering without invented listing facts.
- [x] Verify search, category results, and admin records.

# Real Noida photos and contacts
- [x] Verify official contacts for all 11 listings; update changed contacts and keep confirmed numbers.
- [x] Source and save official venue photos for 10 listings, retaining source notes and owner listings.
- [ ] Replace Lemon Tree Hotel's remaining placeholder: official photo downloads time out and its page capture has no usable photo; needs an accessible official image or owner-provided photo.
- [x] Verify the 10 saved photos load for visitors and updated contacts read back on public pages.

# Complete Noida category coverage
- [x] Research and verify at least one real Noida business for each empty main category.
- [x] Import 28 verified listings with official source notes and no fabricated facts.
- [x] Verify all 32 main Noida category pages have approved public results (39 listings total).

# Real photos for newly added Noida listings
- [x] Restore visitor results: support safe imported descriptive photo filenames and isolate photo failures; 8 tests pass; signed-out Noida search shows 39 results, homepage/category listings and all 17 new photos verified.
- [x] Research all 28 official sites; visually verify authentic photos for 17 listings and reject stock, illustrated, and AI-generated substitutes.
- [x] Save verified photos privately for 17 listings, link them to listings, and retain official source notes.
- [x] Verify all 17 photos load on listing pages in the signed-in preview, including desktop/mobile views; no runtime errors.
- [ ] Source authentic photos for the remaining 11: Noida Luxury Spa, Deepak Bhargava & Associates, Carqlinic, Bala Ji Enterprises, Fix Fast Electrical, Mobile House, Dreamland Interior Designers, ZX Pest Control, Doon Pet Shop, Noida Home Tutor, Wholesale Story. Blocker: checked official sources expose only stock/generated/illustrated images or no accessible genuine business photo; need an accessible verified gallery or owner-provided photos.
- [x] Verify signed-out public delivery for all 17 newly saved photo sets after correcting filename validation; all listing pages and images load without runtime errors.