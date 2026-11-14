# Phase 2: accurate, maintainable directory data

## Preserve and extend
Extend the existing admin Businesses and Products & services pages and the owner dashboard. Preserve all current accounts, listings, media, reviews, leads, offerings and public URLs. No replacement database, reseeding, automatic merges or guessed business facts.

## Current findings
- Business editing, approvals, catalogue forms, authentication and controlled photo delivery already exist.
- Categories, subcategories and city choices are currently hard-coded; category attributes and managed geographic relationships are missing.
- Owners can currently change approved listing details and publish offerings without a separate review workflow. Routine listing deletion is permanent.
- There is no persistent quality queue, import staging, revision history or audited duplicate merge workflow.
- Desire Home Interior currently says Noida in both its city and address, so the previous Mumbai conflict is not present. Its locality/pincode relationship still requires evidence rather than an assumed correction.
- Gypsum Ceiling currently contains development instructions in its published description. Flag the existing content for correction without inventing replacement text; block future publication of similarly obvious placeholder content unless explicitly reviewed.

## 1. Managed categories and fields
- Add admin category editing: parent/subcategory hierarchy, stable identifier, slug, name, icon, description, aliases, order, active/public status and enquiry label.
- Import the existing category definitions and subcategory labels, preserving current business associations and category URLs.
- Allow admins to define typed category attributes, required fields, allowed choices and public filters. Supply field definitions for restaurants, clinics, interiors, repairs, schools and suppliers without populating unverified business values.
- Use these definitions in existing listing/catalogue forms, search and public category pages. Slug changes retain old links through redirects and resolve listings through stable identifiers.
- Use category-appropriate enquiry labels; never imply that an enquiry is a confirmed booking.

## 2. Locations and business structure
- Add managed cities, localities/sectors and pincodes with stable identifiers and explicit relationships.
- Preserve existing address text while linking only unambiguous matches. Keep unresolved combinations reviewable.
- Add organizations and branch relationships without changing existing listing IDs or URLs. Store service coverage separately from the physical address.
- Store optional coordinates with source, verification status and checked date; do not geocode or label them verified without evidence.
- Flag address/city/locality/pincode conflicts for admin review, including the reported example if the conflict reappears.

## 3. Listing quality centre
- Add a searchable admin queue with issue type, severity, affected fields, assignee, status, private notes and resolution history.
- Detect conflicting locations, missing contacts/photos/required attributes, unknown or unstructured hours, placeholder text, stale records, duplicate candidates and unverified ownership.
- Rechecks update existing issues rather than creating duplicates or erasing their history. Dismissal and resolution require recorded reasons.
- Show owners actionable completeness guidance and clearly distinguish completeness from verification. Private staff notes and evidence remain admin-only.

## 4. Catalogue quality and review
- Extend existing offerings with draft, review and published states while retaining compatibility with the existing published flag and public queries.
- Add category-aware specifications, pricing units, inclusions/exclusions, minimum quantity/area and validated media references.
- Provide an owner/admin preview that can show drafts without exposing them publicly.
- Record revisions and old/new differences. Owner publication requests enter review; admins approve with recorded feedback. Obvious placeholder instructions cannot bypass review through direct requests.
- Retain existing valid published content; flag the reported development description for correction.

## 5. CSV import and duplicate management
- Provide a downloadable CSV template, file parsing, field mapping, staging preview, per-row errors, duplicate candidates and source/provenance fields.
- Persist staged batches and approval history. Invalid rows cannot publish; an explicit admin approval is required before valid rows become public.
- Record applied changes so corrections can be reversed where no later edits or relationship changes make reversal unsafe. Explain conflicts instead of overwriting newer data.
- Never automatically merge records because they share a phone number.
- Add merge preview showing survivor, field choices, linked reviews/leads/offerings/favourites and incoming links. Execute only after explicit confirmation, preserve relationships, archive the replaced listing and retain URL redirects and an audit record.

## 6. Listing changes and archiving
- Replace routine permanent deletion in both dashboards with recoverable archive and restore actions. Archived listings remain available to authorized owners/admins but disappear from public results.
- Stage sensitive owner edits to approved listings for review while the approved version remains public. Show field-by-field differences and approval/rejection feedback.
- Separate owner-visible feedback from private staff notes and imported provenance; do not copy internal notes into owner feedback.
- Capture audit history for administrative edits, approvals, archiving/restoration and merges.

## Technical approach
- Use additive migrations with explicit grants and row-level policies for every new table. Backfill compatible identifiers and review state without deleting legacy fields.
- Extend the existing TanStack authenticated server functions and forms; validate mutations on the server and enforce publication, ownership and archive rules in the database as well.
- Use transactional database operations for approvals, merges and reversible import corrections. Store revisions/audits durably; do not rely on browser state for authorization or history.
- Public reads expose only approved, nonarchived listings and published catalogue content. Keep quality notes, assignments, import staging and review evidence private.
- Preserve the current photo authorization/signing flow and existing cream, orange and navy components.

## Verification and delivery
- Test validation, category hierarchy/slug redirects, conflict detection, completeness, placeholder publication checks, archive/restore and import rejection with isolated fixtures.
- Test merge preservation of relationships and redirects, review differences, revision history and rollback conflicts.
- Exercise signed-in admin category editing/import/review/merge, owner completeness/edit requests/catalogue review, and public search/detail/category journeys.
- Test direct API denial between different owners, owner/admin roles and visitors, including attempted publication/review bypass and private-note access.
- Check populated desktop/mobile pages, keyboard dialog handling, loading/error/success states, existing URLs and route metadata. Run relevant tests and lint and inspect the automatic preview checks.
- Report implemented and tested work separately from any blocked checks or unavailable external dependencies. Phase 1 tasks outside this request remain separate.