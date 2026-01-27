# Listings Smoke Test

## Preconditions
- Web app running: `pnpm --filter web dev`
- API running with valid env: `pnpm --filter api dev`

## Steps
1) Open `/listings` and verify the grid renders.
2) Apply a category filter and confirm the URL updates and results change.
3) Change sort order and confirm results update.
4) Use pagination next/previous and confirm the page number changes.
5) Open a listing card to `/listings/[id]` and confirm gallery, details, and sidebar render.

## Expected
- No console errors in the browser.
- URL query params reflect filters and pagination changes.
- Listing detail page loads without blank sections.
