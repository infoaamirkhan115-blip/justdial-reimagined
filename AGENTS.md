<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Category and location definitions are managed in directory tables and shared through directoryDefinitionsQ; legacy slugs stay linked to stable category identifiers. Why: admins can maintain taxonomy without breaking existing associations or public URLs.
- Real listings, leads and reviews live in Lovable Cloud tables guarded by RLS plus guard triggers; public results show only approved records and strictly filter by selected city. Why: keep results local and prevent owner changes to approval or paid-placement flags.
- Publicly researched listings retain their official source link in website and an import note; do not fabricate photos, ratings, prices, opening status, distance, or establishment dates. Why: published directory facts must remain distinguishable from unverified information.
- Owner dashboard lives under /dashboard and staff panel under /admin inside the authenticated gate; staff access uses is_staff and each data action uses scoped has_permission or existing owner/admin RLS. Why: navigation is not authorization and staff must not inherit broad admin access.
- Products and services use business-linked business_offerings rows with shared dashboard forms, validated authenticated server mutations and parent-business RLS; existing simple services remain intact. Why: detailed catalogs need independent CRUD without duplicating owner/admin logic or exposing hidden business data.
- Business photo storage stays private with uploader/admin direct reads only; public photo delivery uses a validated server function that checks approved listing or published offering references with anonymous RLS before privileged, one-hour URL signing. Why: preserve public images without granting guests direct storage reads or exposing draft/unlinked uploads.
- Photo paths permit safe descriptive filenames inside UUID owner folders, and signing failures return partial photo results rather than rejecting listing queries. Why: imported official photos must not make public listings disappear.
- Listing AI uses an authenticated server function and the AI Gateway SDK with validated draft facts; previews only update the shared form after explicit acceptance. Why: keep credentials private and prevent AI from silently changing saved listings.
- Contextual enquiry popups reuse the saved-lead form and carry the selected business or offering's title and image. Why: send enquiries to a real approved listing without losing the visitor's service context.
- Public directory search uses published offering titles with client-safe matching rules, strict city/locality selection, and URL-backed pagination; database failures remain errors and unknown hours/distances remain null. Why: avoid false empty results and unrelated-city matches without guessing facts.
- Favourites use authenticated server mutations and owner-only database policies; pending save intent and short-lived onboarding details survive authentication. Why: persist real customer actions without granting access to another user's saved businesses.
- Public enquiry inserts are validated and rate-limited by phone in a database trigger. Why: direct API submissions must obey the same safety rules as the form.

- Directory quality issues, import staging, staff evidence and audit records are admin-only; owner feedback and change requests have separate access paths. Why: internal notes must never leak through public listings or owner profiles.
- Approved owner edits are staged by database triggers; catalogue publication, imports, merges and recoverable archives are validated transactionally. Why: direct API calls must obey the same review and preservation rules as the dashboards.
- Trust workflows use authenticated server wrappers, private evidence storage and transactional database decision functions; public verification projects only active scope/summary/dates. Why: no evidence or privileged role mutation may leak into public reads.
- Operational tickets, requirements and lead outcomes use validated authenticated RPCs with scoped staff/owner authorization and separate private messages; public support creation returns only a reference. Why: support persistence must not expose conversations or staff notes.
- In-app notifications have an idempotent recipient/event ledger and bounded processing; external email delivery remains Lovable-managed without application email queues or tables. Why: inbox states must not impersonate external-provider delivery.
- Directory event inputs exclude contacts, identifiers and free-form attribution; operational events originate in database triggers and dashboards use filtered SQL aggregates. Why: intent, reported outcomes and delivery must remain distinct and totals must not depend on pagination.
