# Refactor Plan (Audit)

## Composants dupliqués / incohérents (front)
- Tabs: `apps/web/app/components/ui/tabs.tsx` et `apps/web/app/profile/components/tabs/tabs.tsx` implémentent la même base Radix → à unifier.
- Layout container: `apps/web/components/layout/AppShell.tsx` introduit un wrapper tandis que d’autres pages utilisent `<main>` simple ou des wrappers maison (ex: `apps/web/app/page.tsx`, `apps/web/app/listings/page.tsx` header interne) → harmoniser.
- États vides/erreur/squelettes définis inline (ex: `EmptyState`/`ErrorState`/`ListingsSkeleton` dans `apps/web/app/listings/page.tsx`, loaders texte dans `apps/web/app/listings/NewListings.tsx`, `apps/web/app/profile/components/tabs/MyListings.tsx`) → factoriser en composants communs.
- Modals: `LoginModal.tsx`, `SignUpModal.tsx` utilisent un overlay custom alors que `NewListingModal.tsx` s’appuie partiellement sur shadcn Dialog → standardiser via un seul socle Dialog.
- Pagination & filtres: logiques et styles implémentés directement dans `apps/web/app/listings/page.tsx` au lieu d’un composant commun (risque de duplication si réutilisé).

## Helpers dupliqués / dispersés (front)
- Résolution d’URL image: `apps/web/app/profile/components/imageUrl.tsx` est utilisée par ListingCard, page listing détail, Header → à déplacer en `lib/resolveImageUrl` et exposer via un seul import.
- Tabs utilitaire `cn` importé depuis différents chemins relatifs; prévoir un export centralisé via `lib/index.ts`.
- Query helpers: `getNumberParam`/`setSearchParams` déjà présents (`apps/web/app/lib/query.ts`) mais non exposés via un barrel; à centraliser pour éviter futures redéfinitions.
- API client unique dans `apps/web/app/lib/api.ts` (fetch) — vérifier qu’aucun autre fetcher n’est recréé en local lors des écrans à refactor.

## Patterns UI répétés
- Grilles de cartes + skeleton + empty/error répétés (listings grid, new listings carousel, “My Listings”) sans composants partagés.
- Headers de page (titre + description + actions) construits ad hoc sur plusieurs pages → besoin d’un `PageHeader` commun.
- Boutons/filtres/pagination écrits à la main (listings) plutôt qu’en composants communs (`FiltersBar`, `Pagination`).
- Auth modals/formulaires utilisent des inputs/labels custom, non shadcn → incohérence visuelle avec le reste.
- Variations d’avatars/containers/paddings entre Header, Profile et Cards (pas de thème unique).

## Backend – duplications structurelles
- Multer config dupliquée: avatar upload (`apps/backend/src/auth/auth.controller.ts`) et listing images (`apps/backend/src/listings/listings.controller.ts`) définissent chacun storage, filtres, limites → à factoriser dans `common/multer/*`.
- Guards/décorateurs: `JwtAuthGuard` et `GetUser` utilisés depuis `src/auth/*` directement; prévoir un `common/guards` + `common/decorators` pour import unique.
- Messages d’erreur/formats (BadRequestException texte, mime types) répétés dans les deux contrôleurs d’upload.

## Propositions de consolidation (cible)
- Structure `apps/web` :
  - `components/ui/` : conserver shadcn (button, card, dialog, sheet, tabs, select, badge, avatar, dropdown-menu, skeleton, toast, etc.).
  - `components/common/` : `Header`, `BottomNav`, `PageHeader`, `EmptyState`, `ErrorState`, `SkeletonGrid`, `ConfirmDialog`, `FiltersBar`, `Pagination`, `ListingCard`.
  - `features/<domaine>/` : `listings/` (modale création, cartes, filtres), `auth/` (Login/Signup modals), `profile/`, `messages/`.
  - `lib/` : `api`, `query`, `resolveImageUrl`, `formatMoney`, `formatLocation`, `cn`, `react-query-client`; ajouter `lib/index.ts` barrel.
  - `hooks/` : `useDisclosure`, `useIsMobile`, `useDebounce`, etc.
  - `types/` : `Listing`, `User`, `ListingImage`, partagés.
- Backend :
  - `src/common/guards` (`jwt-auth.guard`), `src/common/decorators` (`get-user.decorator`).
  - `src/common/multer` : options avatar + listing images (dossier uploads, filtres mime, max files/size, filename uuid).
  - `src/common/errors` : helpers pour 404/403 ou messages partagés si présents.

## Risques & stratégie de migration
- Migration progressive par blocs (UI commons → pages → features) pour éviter les régressions visuelles; conserver les textes Mongol intacts.
- Mettre en place les barrel exports (`components/common/index.ts`, `lib/index.ts`) puis migrer les imports page par page.
- Harmoniser Tabs en supprimant la version doublon après remplacement des usages (`profile/components/tabs` → `components/ui/tabs`).
- Remplacer les modals auth par une base Dialog sans toucher aux payloads/handlers.
- Extraire `resolveImageUrl` et mettre à jour tous les imports (ListingCard, Header, Listing détail) dans une PR/étape unique.
- Backend: extraire multer config partagée puis rebrancher les contrôleurs; valider que les chemins/limites restent identiques.
- Vérifier AppShell/containers après déplacement pour éviter des décalages de padding/max-width.

## Checklist d’acceptance
- [ ] `pnpm -w lint`
- [ ] `pnpm -w test` (ou équivalent) si présent
- [ ] `pnpm -w build`
- [ ] Pages clés OK: home, `/listings`, `/listings/[id]`, `/profile`, `/messages`
- [ ] Modals OK: login, signup, new listing (flow 4 étapes), confirm dialogs
- [ ] Uploads OK: avatar, listing images (3 max)
- [ ] Navigation mobile: Header + BottomNav fonctionnels

## MVP UI source of truth
- UI components live in `apps/web/src/components/ui` (source of truth for MVP).
- Common patterns live in `apps/web/src/components/common` (to be created/used as needed).
- `@repo/ui` is deprecated for the MVP; avoid new usage.
