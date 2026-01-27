# i18n / Encoding Audit (apps/web)

## Scope
- Frontend: `apps/web`
- Optional scan roots: `packages/shared` (none found with issues)

## Detection Summary (initial scan)
### Literal "????" placeholders (UI hardcoded)
- `apps/web/src/features/offerers/OfferersClient.tsx`:96,98,99,100,150,161,164,179,182,193,212,223,230,257,262,275,278,289,308,319,326,342,355,357,363,365,372,384,392,406,461,465,471,472,504,511,523
- `apps/web/src/features/messages/components/ThreadList.tsx`:23,26,47,67
- `apps/web/src/features/messages/components/MobileThreadList.tsx`:18,24,44,64
- `apps/web/src/features/messages/components/ConversationPanel.tsx`:47,60,69,89,109,125,129

### Encoding mojibake (UTF-8 text saved as Latin-1)
- `apps/web/src/features/listings/ListingsClient.tsx`:54,93,97,98,109,113,121,123,128,134,142,177,178,184,193,201,209,210,226,236,240,244,245,247,254,274,275,285
- `apps/web/src/components/common/ErrorState.tsx`:43
- `apps/web/src/lib/categories.ts`:16-23 (category labels)
- `apps/web/src/features/listings/components/ListingDetailsCard.tsx`:46,58,66,71
- `apps/web/src/features/listings/components/ListingGallery.tsx`:23
- `apps/web/src/features/listings/components/ListingSidebar.tsx`:44,49,54,55,66,80,91,105,121

### U+FFFD replacement character
- None found

### Invalid UTF-8 bytes
- None found (verified by `scripts/check-utf8-and-questionmarks.mjs`)

## Recovery via Git
All recoverable strings were restored from Git history (same wording).
- `apps/web/src/features/offerers/OfferersClient.tsx` restored from `apps/web/app/offerers/OfferersClient.tsx`.
- `apps/web/src/features/messages/components/ThreadList.tsx` restored from `apps/web/app/messages/components/ThreadList.tsx`.
- `apps/web/src/features/messages/components/MobileThreadList.tsx` restored from `apps/web/app/messages/components/MobileThreadList.tsx`.
- `apps/web/src/features/messages/components/ConversationPanel.tsx` restored from `apps/web/app/messages/components/ConversationPanel.tsx`.
- `apps/web/src/features/listings/ListingsClient.tsx` restored from `apps/web/app/listings/ListingsClient.tsx` (text only; logic retained).
- `apps/web/src/features/listings/components/ListingDetailsCard.tsx` restored from `apps/web/app/listings/[id]/components/ListingDetailsCard.tsx`.
- `apps/web/src/features/listings/components/ListingGallery.tsx` restored from `apps/web/app/listings/[id]/components/ListingGallery.tsx`.
- `apps/web/src/features/listings/components/ListingSidebar.tsx` restored from `apps/web/app/listings/[id]/components/ListingSidebar.tsx`.
- `apps/web/src/lib/categories.ts` restored from `apps/web/app/lib/categories.ts`.
- `apps/web/src/components/common/ErrorState.tsx` fixed default label to Mongolian.

## i18n Files
- No `locales/*.json`, `messages/*.json`, or similar translation files found in `apps/web`.

## API Check
- No `"????"` or U+FFFD found in `apps/api`.
- Mongolian category labels are frontend constants; API endpoints appear to return user-provided content (DB).

## Guardrails Added
- `.editorconfig` enforces `charset = utf-8` and `end_of_line = lf`.
- `scripts/check-utf8-and-questionmarks.mjs` scans for invalid UTF-8, `"????"`, and U+FFFD.
- `package.json` script: `check:i18n`.

## Status
- All detected placeholders/encoding issues corrected via Git.
- No remaining `TODO_MN_TEXT`.
- Validation:
  - `pnpm check:i18n` (pass)
  - `pnpm --filter web build` (pass)
  - `pnpm --filter web lint` (warnings only: `apps/web/src/components/ui/avatar.tsx` uses `<img>` without `alt`)
