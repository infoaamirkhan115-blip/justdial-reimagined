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

- Site content (businesses, categories, cities) lives as sample data in src/data/catalog.ts; shared site chrome and building blocks live in src/components/site/. Why: no backend yet, so one data module keeps pages consistent and easy to swap for Lovable Cloud later.
- Real listings, leads and reviews live in Lovable Cloud tables guarded by RLS plus guard triggers (owners cannot change status/plan/verified/sponsored); public pages show only DB listings (the former sample businesses were imported as approved rows; catalog.ts keeps categories/cities). Why: lets owners and admins manage real data without breaking the demo content.
- Owner dashboard lives under /dashboard and admin panel under /admin (both inside the _authenticated gate; admin also checks has_role). Why: one sign-in, two role-based workspaces.
- Products and services use business-linked business_offerings rows with shared dashboard forms, validated authenticated server mutations and parent-business RLS; existing simple services remain intact. Why: detailed catalogs need independent CRUD without duplicating owner/admin logic or exposing hidden business data.
- Business photo storage stays private: uploaders and admins can read uploads, while guests can read only files referenced by approved listings or published offerings of approved listings. Why: keep public listing images working without exposing draft or unlinked uploads.
- Listing AI uses an authenticated server function and the AI Gateway SDK with validated draft facts; previews only update the shared form after explicit acceptance. Why: keep credentials private and prevent AI from silently changing saved listings.
- Contextual enquiry popups reuse the saved-lead form and carry the selected business or offering's title and image. Why: send enquiries to a real approved listing without losing the visitor's service context.
