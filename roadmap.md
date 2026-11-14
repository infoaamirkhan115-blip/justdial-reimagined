# Phase 5 operational support, notifications and measurable outcomes
- [ ] Add persistent support tickets, real references, private notes, conversation history and customer/owner/admin queues.
- [ ] Inspect Phase 3 prerequisites and approved providers; add honest notification setup, consent, outcome and duplicate-prevention controls.
- [ ] Add privacy-conscious directory events and owner-scoped outcome analytics with precise metric definitions.
- [ ] Replace overview totals with filtered database aggregates and actionable operational queues.
- [ ] Verify persistence, access isolation, notification idempotency, aggregate accuracy and desktop/mobile journeys using isolated fixtures.

# Phase 4 ownership, trust and staff controls
- [x] Add existing-business claims, private evidence updates, competing-claim review and controlled transfer/revocation; isolated browser submission persisted without ownership transfer.
- [x] Separate evidence-backed verification from paid plans; retain historical flags in staff audit and show public badges only for recorded active checks.
- [x] Replace signup administrator bootstrap with controlled provisioning, eight least-privilege roles, scope checks, self-escalation denial and last-admin safeguards; existing admin preserved.
- [x] Audit sensitive actions; add customer reports, moderation reasons, appeals and activity history. Isolated browser report/decision and authenticated appeal/restore passed.
- [x] Verify 54 tests, preview type/build checks, targeted lint, signed-in trust pages, mobile layout, isolated claims/moderation, guest denial and direct role/self-review denial; test businesses archived.
- [ ] Verify cross-owner evidence isolation, competing-claim approval/transfer/revocation and last-admin removal under multiple accounts. Blocker: only one existing admin account; no second-account session is available.

# Phase 2 directory data administration
- [x] Add managed categories, hierarchy, fields, aliases, visibility and legacy URL compatibility; admin create/edit and public category route checked.
- [x] Add managed cities/localities/pincodes, organization/branch links, separate service areas and coordinate evidence fields.
- [x] Add persistent quality queue, severity/status/assignment, private notes, ownership evidence, history and owner completeness; 111 real issues recorded.
- [x] Add catalogue review states, specifications, scope/minimums, draft preview, publication guards and revisions.
- [x] Add staged CSV mapping, validation, provenance, batch history and transactional approval/reversal; isolated batch approval and reversal persisted, with its test listing archived.
- [x] Add explicit duplicate merge preview, audited transactional relationship preservation and redirects; isolated offering move and redirect checked.
- [x] Replace listing deletion with archive/restore and stage sensitive owner edits; staff notes separated from owner feedback.
- [x] Verify 46 automated tests, targeted lint (zero errors), automatic preview checks, populated desktop/mobile admin pages, all 40 public records, hidden category edits, archive persistence, isolated merge preservation and guest private-data denial.
- [ ] Verify cross-owner denial and nonadmin review journeys. Blocker: only one existing admin account is available; no second owner session supplied.
- [ ] Complete browser form journey for CSV publication/reversal and owner sensitive-edit approval with isolated fixtures. Import approval/reversal passed direct authenticated checks; owner approval still needs a nonadmin session.

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