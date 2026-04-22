# Rapport d'audit architecture — Tusch.mn
**US-48 · Phase consolidation C1 · 2026-04-22**

---

## Section 1 — État actuel

### apps/api (NestJS 11)

#### Arborescence

```
apps/api/src/
├── main.ts                          (90 L) — bootstrap, pipes globaux, Swagger
├── app.module.ts                    (73 L) — 13 modules importés, throttling, middleware
├── common/
│   ├── decorators/
│   │   ├── get-user.decorator.ts    (8 L)
│   │   └── roles.decorator.ts       (5 L)
│   ├── dto/
│   │   └── paginated-response.dto.ts (23 L)
│   ├── filters/
│   │   ├── global-exception.filter.ts (69 L)
│   │   └── throttler-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        (37 L)
│   │   ├── admin.guard.ts           (33 L)
│   │   ├── email-verified.guard.ts  (37 L)
│   │   ├── listing-ownership.guard.ts (58 L)
│   │   ├── offer-ownership.guard.ts (117 L)
│   │   ├── optional-jwt.guard.ts    (18 L)
│   │   └── roles.guard.ts           (44 L)
│   ├── interceptors/
│   │   └── logging.interceptor.ts   (44 L)
│   ├── middleware/
│   │   └── request-id.middleware.ts
│   └── helpers/
│       └── image-processor.ts       (38 L)
└── modules/
    ├── admin/    — controller (311 L), service (407 L), 5 DTOs
    ├── auth/     — controller (387 L), service (332 L), 8 DTOs
    ├── audit/    — service (50 L), pas de controller
    ├── favorites/ — controller (161 L), service (282 L), 1 DTO
    ├── health/   — controller (59 L)
    ├── listings/ — controller (317 L), service (474 L), 5 DTOs
    ├── messages/ — controller (162 L), service (166 L), 2 DTOs
    ├── metrics/  — controller (38 L), service (50 L)
    ├── notifications/ — controller (108 L), service (77 L), 1 DTO
    ├── offers/   — controller (368 L), service (415 L), 3 DTOs
    ├── reports/  — controller (126 L), service (202 L), 3 DTOs
    ├── reviews/  — controller (93 L), service (167 L), 2 DTOs
    └── user/     — controller (271 L), service (586 L), 2 DTOs
```

#### Modules et responsabilités

| Module | Responsabilité | Dépendances |
|--------|---------------|-------------|
| auth | Inscription, login, OAuth, email vérification, reset mot de passe | UserModule, JWT, bcrypt |
| user | Profil utilisateur, onboarding, zones de service, vérification identité | Prisma, sharp, ImageProcessor |
| listings | Annonces CRUD, recherche full-text, images, soft-delete | Prisma, sharp, ImageProcessor |
| offers | Offres entre clients et prestataires, cycle de vie, expirations | Prisma, NotificationsModule |
| messages | Messagerie directe, threads, lecture | Prisma |
| reviews | Avis post-offre complétée, agrégation rating | Prisma |
| favorites | Favoris annonces + prestataires, toggle | Prisma |
| notifications | Notifications in-app, lecture | Prisma |
| reports | Signalements utilisateurs/annonces | Prisma |
| admin | Dashboard, modération, vérifications, stats | Prisma, NotificationsModule, AuditModule |
| audit | Log des actions admin | Prisma |
| health | Health check | — |
| metrics | Comptage requêtes par status code | — |

#### Technologies et patterns

- NestJS modules + DI, DTOs class-validator, Guards pour l'autorisation
- Prisma comme unique couche DB (pas de repository pattern)
- JWT dans cookies HTTP-only, `OptionalJwtAuthGuard` pour les routes publiques
- Global `ValidationPipe` (whitelist + transform), `LoggingInterceptor`, `GlobalExceptionFilter`
- Sharp pour le traitement d'images (listé dans `common/helpers/`)
- Swagger auto-généré via `@nestjs/swagger`

---

### apps/web (Next.js 16 App Router)

#### Arborescence

```
apps/web/src/
├── app/
│   ├── layout.tsx                   — layout racine (Providers, Header, Footer, BottomNav)
│   ├── page.tsx                     — home (Server Component)
│   ├── listings/
│   │   ├── page.tsx                 — liste annonces (Server Component shell)
│   │   └── [id]/page.tsx            — détail annonce (Server Component + SSR)
│   ├── u/[id]/page.tsx              — profil public prestataire
│   ├── categories/[slug]/page.tsx   — annonces par catégorie
│   ├── villes/[slug]/page.tsx       — annonces par ville
│   ├── messages/page.tsx            — messagerie (Client Component)
│   ├── offerers/page.tsx            — liste prestataires
│   ├── offers/[id]/page.tsx         — détail offre
│   ├── dashboard/                   — espace client (Client Components)
│   ├── profile/                     — espace prestataire (Client Components)
│   ├── onboarding/                  — formulaire multi-étapes
│   ├── admin/                       — back-office admin (Client Components)
│   ├── notifications/page.tsx
│   ├── cgu/page.tsx
│   ├── confidentialite/page.tsx
│   └── api/auth/[...nextauth]/      — NextAuth route handler
├── features/
│   ├── home/components/             — Hero, SearchBar, CategoryGrid, Footer, SignUpModal
│   ├── listings/components/         — ListingsClient (579 L), ListingCard, FiltersBar, NewListingModal (341 L)
│   ├── messages/components/         — MessagesClient (193 L), ConversationPanel
│   ├── offers/components/           — OfferCard (304 L), OffersList
│   ├── offerers/components/         — OfferersClient (612 L), ProviderCard
│   └── profile/                     — EditProfileForm, ServiceZonesForm, VerificationForm
├── components/
│   ├── ui/                          — Button, Card, Input, Select, Badge, Skeleton, etc.
│   ├── layout/                      — Header, BottomNav, AppShell
│   └── common/                      — EmptyState, ErrorState, Pagination, ListingGrid, VerificationBanner
├── lib/
│   ├── api/
│   │   ├── base.ts                  (35 L) — apiFetch<T>()
│   │   ├── listings.ts              (152 L)
│   │   ├── offers.ts                (143 L)
│   │   ├── auth.ts                  (123 L)
│   │   ├── admin.ts                 (108 L)
│   │   ├── users.ts                 (83 L)
│   │   ├── favorites.ts             (52 L)
│   │   ├── reports.ts               (46 L)
│   │   ├── reviews.ts               (39 L)
│   │   ├── messages.ts              (36 L)
│   │   ├── notifications.ts         (24 L)
│   │   ├── verification.ts          (17 L)
│   │   └── types.ts                 (42 L)
│   ├── hooks/
│   │   ├── useApi.ts                (996 L) — 50+ hooks React Query
│   │   └── useFavProviders.ts       (84 L)
│   └── query.ts                     — helpers URL querystring
├── types/                           — augmentations TypeScript globales
└── messages/                        — strings i18n (next-intl, Mongolian)
```

#### Technologies et patterns

- Next.js App Router avec Server Components par défaut, `"use client"` explicite pour l'interactivité
- TanStack React Query v5 pour le cache client (staleTime, invalidation, mutations)
- React Hook Form + Zod pour les formulaires avec validation
- `apiFetch<T>()` comme couche HTTP centralisée dans `lib/api/`
- next-auth v4 pour OAuth (Google, Facebook) + `AuthSync` pour l'échange de token côté API
- next-intl pour i18n (strings MongoDB en `messages/`)
- Tailwind CSS 4 pour les styles

---

### packages/shared

```
packages/shared/src/
├── index.ts         — re-exports
├── enums.ts         (88 L) — UserRole, AdminRole, UserStatus, ListingStatus, NotificationType,
│                              VerificationStatus, ReportTargetType, ReportReason, ReportStatus,
│                              OfferStatus, ListingsSort
├── types.ts         (328 L) — CurrentUser, Listing, Offer, Review, Message, Notification,
│                               Report, pages paginées
├── categories.ts    (18 L) — CATEGORIES array, CATEGORY_LABEL_MAP
└── data/
    └── mn-locations.ts    — villes et districts Mongolie (référence)
```

---

## Section 2 — Problèmes identifiés

### Backend (apps/api)

---

#### API-01 · Logique métier dans le controller auth
**Fichier :** `apps/api/src/modules/auth/auth.controller.ts` (~L180-220)
**Description :** Le controller gère la suppression physique du fichier avatar (`fs.unlinkSync`) lors de la mise à jour du profil. La logique de fichier appartient au service.
**Impact :** Controller non-testable en isolation ; duplication potentielle si un autre endpoint doit faire la même chose.

---

#### API-02 · `UserService` — God service (586 lignes, responsabilités multiples)
**Fichier :** `apps/api/src/modules/user/user.service.ts`
**Description :** Le service mélange : gestion de profil, agrégation de stats, validation des zones de service, traitement de fichiers (soumission vérification), sanitisation de données, onboarding. Chaque responsabilité est une raison de changer indépendamment.
**Impact :** Difficile à tester, à maintenir et à faire évoluer. Toute modification risque de régresser une fonctionnalité non liée.

---

#### API-03 · `ListingsService` — mélange I/O fichiers et Prisma (474 lignes)
**Fichier :** `apps/api/src/modules/listings/listings.service.ts`
**Description :** Le service contient du code de traitement d'images (appels à `processImage`, `generateThumbnail`, `fs.unlink`) entrelacé avec des requêtes Prisma. L'`image-processor.ts` existe déjà dans `common/helpers` mais la gestion du cycle de vie des fichiers reste dans le service.
**Impact :** Logique I/O non mockable dans les tests ; violation du principe de responsabilité unique.

---

#### API-04 · `(this.prisma as any)` dans OffersService
**Fichier :** `apps/api/src/modules/offers/offers.service.ts` (3+ occurrences)
**Description :** Utilisation de `as any` pour contourner le typage Prisma, probablement dû à une propriété relationnelle mal typée ou à un champ computed.
**Impact :** Perte de sécurité de type ; les erreurs de contrat DB ne sont pas détectées à la compilation.

---

#### API-05 · `console.log` du token de vérification email en production
**Fichier :** `apps/api/src/modules/auth/auth.service.ts` (~L60-80)
**Description :** En mode dev, le token de vérification email est loggé avec `console.log`. Si `NODE_ENV` n'est pas correctement positionné en production, ce token sensible apparaîtra dans les logs.
**Impact :** Risque de sécurité (fuite de token d'activation). Utiliser le `LoggingInterceptor` structuré ou une condition stricte `process.env.NODE_ENV === 'development'`.

---

#### API-06 · Strings de notification hardcodées en français dans OffersService
**Fichier :** `apps/api/src/modules/offers/offers.service.ts`
**Description :** Les messages de notification sont des template literals en français directement dans le code : `'${user.firstName} ${user.lastName} a fait une offre sur votre annonce'`. Idem dans `admin.service.ts`.
**Impact :** Impossibilité de gérer l'internationalisation ; cohérence des messages non garantie si le texte change.

---

#### API-07 · DTO de réponse manquants (DTOs asymétriques)
**Fichiers :** Modules `user`, `listings`, `offers`, `admin`
**Description :** Les DTOs d'entrée (requête) sont bien définis avec class-validator, mais les DTOs de réponse sont absents ou partiels. Les types de retour des méthodes de service sont `any` ou inférés directement depuis Prisma.
**Impact :** L'API Swagger documente mal les réponses ; les clients ne peuvent pas inférer les types de retour de façon fiable ; risque d'exposer des champs sensibles (password, tokens).

---

#### API-08 · `OfferOwnershipGuard` — `request.offerOwnership` non typé
**Fichier :** `apps/api/src/common/guards/offer-ownership.guard.ts` (117 L)
**Description :** Le guard positionne `request.offerOwnership = 'provider' | 'client'` mais ce champ n'est pas déclaré dans l'interface `Request` de NestJS. Les controllers qui le lisent utilisent probablement `(req as any).offerOwnership`.
**Impact :** Désynchronisation silencieuse si le nom du champ change ; perte de type-safety.

---

#### API-09 · Requête SQL brute pour la recherche full-text
**Fichier :** `apps/api/src/modules/listings/listings.service.ts` (`fullTextSearch()`)
**Description :** `this.prisma.$queryRaw` avec un template literal SQL pour `plainto_tsquery`. Logique de fallback LIKE imbriquée dans le même service.
**Impact :** Difficile à maintenir et à tester ; les changements de schéma ne sont pas vérifiés par TypeScript. À isoler dans une fonction dédiée ou un helper de recherche.

---

#### API-10 · Couverture de tests insuffisante
**Fichiers :** `apps/api/src/modules/*/` (10 fichiers `.spec.ts` pour 13 modules)
**Description :** Plusieurs modules n'ont aucun test unitaire (`favorites`, `reports`, `admin`, `audit`, `notifications`). Les tests E2E existent mais ne couvrent pas tous les scénarios d'erreur.
**Impact :** Régression non détectée lors d'un refactoring ; confiance limitée dans les déploiements.

---

#### API-11 · `AdminActionLog.meta` typé `Json` (non structuré)
**Fichier :** `apps/api/prisma/schema.prisma` + `apps/api/src/modules/audit/audit.service.ts`
**Description :** Le champ `meta` du log admin est un JSON sans schéma. Les actions loggées ont des structures `meta` différentes non documentées.
**Impact :** Impossible de requêter ou d'analyser les logs de façon fiable sans connaître la structure par module.

---

#### API-12 · Gestion d'erreurs inconsistante dans les services
**Fichiers :** Divers services
**Description :** Certains services lèvent `HttpException` directement (couplage controller-service), d'autres lèvent des erreurs NestJS natives (`NotFoundException`, `BadRequestException`). Le `GlobalExceptionFilter` centralise mais le pattern n'est pas uniforme.
**Impact :** Comportement imprévisible selon le module ; difficile à auditer.

---

### Frontend (apps/web)

---

#### WEB-01 · `useApi.ts` — fichier de 996 lignes avec 50+ hooks
**Fichier :** `apps/web/src/lib/hooks/useApi.ts`
**Description :** Tous les hooks React Query sont dans un seul fichier : listings, offers, users, messages, notifications, favorites, reviews, admin, auth. Aucune séparation par domaine.
**Impact :** Impossible à maintenir à mesure que l'app grandit ; les dépendances croisées entre hooks sont invisibles ; les imports inutilisés ne sont pas détectés par tree-shaking.

---

#### WEB-02 · `OfferersClient.tsx` — composant de 612 lignes
**Fichier :** `apps/web/src/features/offerers/components/OfferersClient.tsx`
**Description :** Un seul composant client gère : la recherche + debounce, les filtres (catégorie, ville, vérification), la pagination, le panel favoris, le rendu de la liste et des cards. Plusieurs sous-responsabilités distinctes.
**Impact :** Difficile à tester, les re-renders touchent tout le composant pour un changement de filtre isolé.

---

#### WEB-03 · `ListingsClient.tsx` — composant de 579 lignes
**Fichier :** `apps/web/src/features/listings/components/ListingsClient.tsx`
**Description :** Même pattern qu'`OfferersClient` : filtres, search debounce, URL sync, pagination, modal de création, rendu liste — tout dans un composant.
**Impact :** Idem WEB-02.

---

#### WEB-04 · `NewListingModal.tsx` — 341 lignes, responsabilités multiples
**Fichier :** `apps/web/src/features/listings/components/NewListingModal.tsx`
**Description :** Formulaire multi-étapes (4 étapes) avec validation Zod, upload d'images, gestion d'erreur API, tout dans un seul composant.
**Impact :** Chaque étape est une unité testable indépendante ; le composant est trop couplé pour être réutilisé.

---

#### WEB-05 · `fetch()` direct dans les Server Components (hors `lib/api/`)
**Fichiers :**
- `apps/web/src/app/listings/[id]/page.tsx`
- `apps/web/src/app/u/[id]/page.tsx`
- `apps/web/src/app/categories/[slug]/page.tsx`
- `apps/web/src/app/villes/[slug]/page.tsx`

**Description :** Ces pages construisent l'URL API directement avec `process.env.NEXT_PUBLIC_API_URL` et appellent `fetch()` sans passer par `lib/api/`. La même logique existe déjà dans `lib/api/listings.ts` et `lib/api/users.ts`.
**Impact :** Duplication de la logique de fetch et de la construction d'URL ; les changements d'API doivent être faits en deux endroits.

---

#### WEB-06 · Double fetch dans `generateMetadata` + `page()`
**Fichiers :** `apps/web/src/app/listings/[id]/page.tsx`, `apps/web/src/app/u/[id]/page.tsx`
**Description :** `generateMetadata()` et le composant `page()` appellent chacun indépendamment la même ressource API (même URL, même data). Next.js déduplique les `fetch()` identiques avec `revalidate`, mais seulement si les options sont exactement identiques.
**Impact :** Potentielle double requête si les options diffèrent légèrement ; pattern non intentionnel.

---

#### WEB-07 · Parsing défensif dans `fetchListingsPage()`
**Fichier :** `apps/web/src/lib/api/listings.ts`
**Description :** La fonction vérifie successivement si la réponse a un champ `items`, `data`, ou est directement un tableau — signe que le format de réponse de l'API a changé ou est inconsistant.
**Impact :** Code mort et fragile ; l'API devrait toujours retourner le même format (géré par `PaginatedResponseDto`).

---

#### WEB-08 · Construction d'URL image non centralisée
**Fichiers :** Multiples composants (`ListingCard`, `ProviderCard`, `OfferCard`, pages profil)
**Description :** La logique `url.startsWith('http') ? url : \`${API_URL}${url}\`` est dupliquée dans au moins 5 composants différents.
**Impact :** Si la stratégie d'URLs change (CDN, etc.), chaque occurrence doit être mise à jour manuellement.

---

#### WEB-09 · `"use client"` inutile sur certaines pages admin
**Fichiers :** Certaines pages dans `apps/web/src/app/admin/`
**Description :** Des pages admin marquées `"use client"` pourraient être des Server Components avec des Client Components enfants pour l'interactivité (tableaux éditables, modals).
**Impact :** JavaScript bundle inutilement grossi côté client ; perte du bénéfice SSR pour le contenu statique.

---

#### WEB-10 · Styles inline présents dans les composants features
**Fichiers :** Composants dans `features/`
**Description :** Présence de `style={{ ... }}` inline dans certains composants alors que Tailwind CSS 4 est disponible et utilisé partout ailleurs.
**Impact :** Inconsistance de style ; les styles inline ne bénéficient pas du purge CSS de Tailwind.

---

#### WEB-11 · Pas de gestion d'erreur globale côté client
**Fichiers :** Client Components avec `useQuery` / `useMutation`
**Description :** Les erreurs React Query sont gérées localement dans chaque composant avec des conditions `if (isError)`. Il n'y a pas d'Error Boundary global ni de toast système centralisé pour les erreurs réseau.
**Impact :** UX inconsistante en cas d'erreur ; risque de composants silencieusement vides.

---

#### WEB-12 · Types dupliqués entre `lib/api/types.ts` et `@repo/shared`
**Fichier :** `apps/web/src/lib/api/types.ts` (42 L)
**Description :** Ce fichier re-exporte certains types depuis `@repo/shared` mais en redéfinit d'autres. La frontière entre "type partagé" et "type web-spécifique" n'est pas claire.
**Impact :** Divergence possible entre la définition côté web et côté API si un type évolue.

---

### Shared (packages/shared)

---

#### SH-01 · Types de réponse paginée absents ou partiels
**Fichier :** `packages/shared/src/types.ts`
**Description :** Des types comme `ListingsPage`, `ProvidersPage`, `UsersPage` sont définis dans shared mais le type générique `PaginatedResponse<T>` n'est pas utilisé systématiquement — le DTO côté API (`PaginatedResponseDto`) est séparé.
**Impact :** Désynchronisation possible entre le format de réponse API et le type TypeScript partagé.

---

#### SH-02 · `CATEGORIES` dupliqué entre shared et web
**Fichiers :** `packages/shared/src/categories.ts` + `apps/web/src/lib/categories.ts`
**Description :** Les catégories sont définies dans `@repo/shared` mais `apps/web/src/lib/categories.ts` semble maintenir une copie ou une variante.
**Impact :** Risque de désynchro si une catégorie est ajoutée d'un seul côté.

---

#### SH-03 · Constantes de notification non partagées
**Fichier :** `packages/shared/src/enums.ts`
**Description :** `NotificationType` est bien dans shared, mais les templates de messages de notification (en français) sont hardcodés dans `offers.service.ts` et `admin.service.ts` côté API. Ces strings ne sont pas dans shared.
**Impact :** Impossible de typer ou de valider les messages côté web si on voulait les afficher différemment.

---

#### SH-04 · `mn-locations.ts` présent côté shared et potentiellement côté API
**Fichier :** `packages/shared/src/data/mn-locations.ts`
**Description :** Les données de référence géographique sont dans shared mais `user.service.ts` importe-t-il directement ce fichier ou en maintient-il une copie pour la validation ?
**Impact :** Si copié, risque de désynchro entre validation API et affichage web.

---

## Section 3 — Plan de refactoring priorisé

### 🔴 P0 — Problèmes bloquants ou créateurs de bugs

| ID | Problème | Fichier(s) | Taille |
|----|----------|-----------|--------|
| API-05 | `console.log` du token email en prod | `auth.service.ts` | S |
| API-04 | `(this.prisma as any)` dans OffersService | `offers.service.ts` | S |
| API-08 | `request.offerOwnership` non typé | `offer-ownership.guard.ts` + controllers | S |
| WEB-07 | Parsing défensif `fetchListingsPage()` — contrat API flou | `lib/api/listings.ts` | S |
| SH-02 | `CATEGORIES` dupliqué shared/web | `shared/categories.ts` + `web/lib/categories.ts` | S |

---

### 🟠 P1 — Dette technique importante

| ID | Problème | Fichier(s) | Taille |
|----|----------|-----------|--------|
| WEB-01 | `useApi.ts` 996 lignes → découper par domaine | `lib/hooks/useApi.ts` | M |
| API-02 | `UserService` God service → extraire `UserProfileService`, `UserVerificationService` | `user.service.ts` | M |
| API-03 | I/O fichiers dans `ListingsService` → extraire `ListingImageService` | `listings.service.ts` | M |
| WEB-02 | `OfferersClient` 612 L → composants `OffererFilters`, `OffererList`, `FavoritesPanel` | `OfferersClient.tsx` | M |
| WEB-03 | `ListingsClient` 579 L → composants `ListingsFilters`, `ListingsList` | `ListingsClient.tsx` | M |
| WEB-05 | `fetch()` direct dans Server Components → utiliser `lib/api/` | 4 fichiers `page.tsx` | M |
| API-07 | DTOs de réponse manquants (expositions champs sensibles) | modules user, listings, offers, admin | L |
| API-01 | Logique `fs.unlink` dans controller auth | `auth.controller.ts` | S |
| WEB-08 | Construction URL image non centralisée → `lib/image.ts` | 5+ composants | S |
| API-06 | Strings de notification hardcodées en français | `offers.service.ts`, `admin.service.ts` | S |
| API-12 | Gestion d'erreurs inconsistante (HttpException vs NestJS exceptions) | divers services | M |
| SH-01 | `PaginatedResponse<T>` non utilisé systématiquement | `shared/types.ts` + DTO API | S |

---

### 🟡 P2 — Confort et qualité, peut attendre

| ID | Problème | Fichier(s) | Taille |
|----|----------|-----------|--------|
| WEB-04 | `NewListingModal` 341 L → étapes en sous-composants | `NewListingModal.tsx` | M |
| API-09 | Requête SQL brute pour full-text search → helper dédié | `listings.service.ts` | S |
| WEB-06 | Double fetch `generateMetadata` + `page()` → cache ou data function partagée | pages `[id]` | S |
| WEB-09 | `"use client"` inutiles dans admin → audit + conversion | pages `admin/` | M |
| WEB-11 | Pas d'Error Boundary global côté client | App shell | S |
| WEB-10 | Styles inline → utilitaires Tailwind | composants `features/` | S |
| API-10 | Tests unitaires manquants (favorites, reports, admin, audit) | modules concernés | L |
| API-11 | `AdminActionLog.meta` non structuré | schema.prisma + audit.service | S |
| SH-03 | Templates messages notification non partagés | offers.service, admin.service | S |
| SH-04 | Vérifier import `mn-locations.ts` côté API vs shared | user.service.ts | S |
| WEB-12 | Frontière types `lib/api/types.ts` vs `@repo/shared` floue | types.ts | S |

---

## Section 4 — Patterns cibles à appliquer

### Backend

**Controller = HTTP uniquement**
```typescript
// ✅ Correct
@Post()
async create(@Body() dto: CreateListingDto, @GetUser() user: CurrentUser) {
  return this.listingsService.create(dto, user.id);
}

// ❌ À éviter
@Post()
async create(...) {
  fs.unlinkSync(oldFile); // ← logique dans le controller
  const listing = await this.listingsService.create(...);
  return listing;
}
```

**Service = logique métier, pas de responsabilités mélangées**
- Un service par domaine fonctionnel
- Si un service dépasse 300 lignes → identifier les sous-domaines et extraire
- Exemples :
  - `UserService` → `UserProfileService` + `UserVerificationService`
  - `ListingsService` → `ListingsService` + `ListingImageService`

**DTOs de requête + DTOs de réponse séparés**
```typescript
// Entrée
class CreateOfferDto { @IsNumber() price: number; @IsString() message: string; }

// Sortie — explicite, sans champs sensibles
class OfferResponseDto {
  id: string; price: number; status: OfferStatus;
  provider: { id: string; firstName: string; avatarUrl: string | null };
}
```

**Enums et constantes partagés dans `@repo/shared` si utilisés des deux côtés**
- `OfferStatus`, `NotificationType`, `UserRole` → déjà dans shared ✅
- Templates de messages de notification → ajouter dans `shared/notifications.ts`
- `CATEGORIES` → consolider dans shared uniquement ✅

**Gestion des erreurs — pattern uniforme**
```typescript
// ✅ Utiliser les exceptions NestJS natives dans les services
throw new NotFoundException(`Listing ${id} not found`);
throw new ForbiddenException('Cannot modify an accepted offer');
// Le GlobalExceptionFilter s'en charge
```

**Typage de `request` étendu pour les guards custom**
```typescript
// apps/api/src/types/express.d.ts
declare global {
  namespace Express {
    interface Request {
      offerOwnership?: 'provider' | 'client';
      requestId?: string;
    }
  }
}
```

---

### Frontend

**Server Component par défaut, `"use client"` seulement si nécessaire**
```tsx
// ✅ Server Component — pas de 'use client'
export default async function ListingPage({ params }) {
  const listing = await fetchListingById(params.id); // lib/api/listings.ts
  return <ListingDetail listing={listing} />;
}

// Client Component enfant uniquement pour l'interactivité
'use client';
export function ListingActions({ listing }: { listing: Listing }) { ... }
```

**Un composant = une responsabilité**
- `ListingsClient` → `ListingsFiltersBar` + `ListingsGrid` + `ListingsPagination`
- `OfferersClient` → `OfferersFilters` + `OfferersList` + `FavoritesPanel`
- Règle : si un composant fait plus de 200 lignes, chercher la séparation naturelle

**Logique réutilisable → hook dans `lib/hooks/`**
- Découper `useApi.ts` par domaine :
  - `useListings.ts`, `useOffers.ts`, `useUsers.ts`, `useMessages.ts`,
    `useFavorites.ts`, `useReviews.ts`, `useNotifications.ts`, `useAdmin.ts`

**Tous les appels API → `lib/api/*.ts` avec types typés**
```typescript
// ✅
import { fetchListingById } from '@web/lib/api/listings';
const listing = await fetchListingById(id); // type: Listing

// ❌
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/listings/${id}`);
```

**URL images → helper centralisé**
```typescript
// lib/image.ts
export function resolveImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${process.env.NEXT_PUBLIC_API_URL}${path}`;
}
```

**Features folder pour composants métier complexes**
- Chaque feature = dossier `features/<domain>/components/` + `features/<domain>/hooks/` si nécessaire
- Composants génériques (Pagination, EmptyState, Skeleton) → `components/common/`

---

## Section 5 — Ce qu'on NE fait PAS

Les items suivants sont **explicitement hors scope** de ce refactoring :

- **Pas de DDD formel** : pas d'Entities, Aggregates, Value Objects, Domain Events. Prisma + services NestJS suffisent.
- **Pas de Repository pattern abstrait** : pas d'interface `IListingRepository` avec implémentation Prisma. `PrismaService` est injecté directement dans les services — c'est délibéré et suffisant à cette échelle.
- **Pas de changement de stack** : NestJS, Next.js, Prisma, PostgreSQL, TanStack Query — tout reste en place.
- **Pas de migration massive de données** : aucune modification de schéma `schema.prisma` dans ce refactoring sauf pour la correction API-11 (typage `meta`) si possible sans migration destructive.
- **Pas de micro-services** : le monorepo reste un monolithe modulaire.
- **Pas de réécriture des tests E2E** : les tests Playwright existants restent tels quels ; seuls des tests unitaires sont ajoutés là où ils manquent (P2, API-10).
- **Pas de changement d'architecture d'authentification** : NextAuth + JWT cookies reste le pattern cible.
- **Pas de Redux / Zustand** : TanStack React Query gère le cache serveur ; pas d'état global client supplémentaire.

---

*Rapport généré le 2026-04-22 dans le cadre de US-48 — Phase consolidation C1.*
*Aucun fichier de code n'a été modifié dans ce rapport.*
*Les refactorings concrets suivront dans US-49 (backend) et US-50 (frontend).*
