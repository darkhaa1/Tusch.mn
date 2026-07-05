# Chapitre 5 — Frontend (Next.js)

## 5.1 Architecture App Router

Le frontend est une application **Next.js 16** utilisant l'**App Router** (`apps/web/src/app`), avec **React 19** et **TailwindCSS 4**. Le rendu privilégie les **Server Components** par défaut ; les composants interactifs sont marqués `"use client"` au cas par cas. Le layout racine (`app/layout.tsx`) déclare la langue (`<html lang="mn">`), charge les polices Noto, et compose la structure globale : `Header`, bannière de vérification, contenu, `Footer`, et `BottomNav` (navigation mobile basse). Les providers React (session NextAuth, TanStack Query, i18n) enveloppent l'arbre.

## 5.2 Structure des dossiers

```
apps/web/src/
├── app/         # Routes, layouts (App Router) + /api/auth (NextAuth)
├── features/    # UI + logique par domaine (auth, home, listings,
│                #   messages, offerers, offers, profile)
├── components/  # common, header, layout, nav, report, seo, ui
│   └── ui/      # Primitives (button, card, dialog, input, tabs, …)
├── lib/
│   ├── api/     # Clients API par domaine (wrappers fetch + React Query)
│   ├── firebase/# SDK Firebase client (auth téléphone)
│   ├── hooks/   # Hooks partagés
│   ├── i18n/    # Configuration next-intl
│   └── query/   # Configuration TanStack Query
├── messages/    # Traductions (mn.json, en.json)
├── styles/      # globals.css (tokens + Tailwind)
└── types/       # Augmentations de types globales
```

Les imports utilisent les alias `@web/*` et `@shared/*` pour éviter les chemins relatifs profonds.

## 5.3 Server Components vs Client Components

La règle appliquée suit les recommandations Next.js :

- **Server Components (défaut)** : pages de contenu, pages SEO (catégories, villes), profils publics, détail d'annonce — tout ce qui bénéficie du rendu serveur (SEO, *time-to-first-byte*, moins de JS expédié).
- **Client Components (`"use client"`)** : formulaires (react-hook-form), composants reposant sur TanStack Query, états interactifs (messagerie, filtres, carrousels d'images via `embla-carousel`), et tout ce qui consomme la session ou des hooks navigateur.

## 5.4 State management : TanStack Query

La gestion des données distantes repose sur **TanStack Query** (`@tanstack/react-query`). Les hooks `useApi` par domaine encapsulent les `useQuery`/`useMutation`, les clés de cache et l'invalidation. Cela couvre nativement les états de chargement, d'erreur et la revalidation, et permet le **polling** (notifications et messages rafraîchis ~30 s). La configuration du `QueryClient` est centralisée dans `lib/query`.

## 5.5 Couche API client

Chaque domaine dispose d'un fichier dans `lib/api/`, au-dessus d'un client de base commun (`base.ts`) qui gère l'URL de l'API (`NEXT_PUBLIC_API_URL`), l'envoi des cookies (`credentials: 'include'`) et la normalisation des erreurs.

| Fichier | Domaine couvert |
|---------|-----------------|
| `auth.ts` | Inscription, connexion, profil, mot de passe |
| `auth-methods.ts` | *(**À venir : US-A4**)* snapshot des méthodes d'auth |
| `users.ts` | Profil étendu, providers, profil public |
| `listings.ts` | Annonces, recherche, images |
| `offers.ts` | Offres et cycle de vie |
| `messages.ts` | Messagerie |
| `reviews.ts` | Avis |
| `favorites.ts` | Favoris |
| `notifications.ts` | Notifications |
| `email-preferences.ts` | Préférences email |
| `verification.ts` | KYC |
| `reports.ts` | Signalements |
| `admin.ts` | Back-office |
| `base.ts` / `types.ts` / `index.ts` | Socle commun, types, ré-exports |

## 5.6 Internationalisation

L'i18n repose sur **next-intl** avec deux locales : **`mn` (mongol, par défaut)** et `en`. Les messages sont dans `src/messages/mn.json` et `en.json`. La langue HTML est figée à `mn`, le fuseau de référence est `Asia/Ulaanbaatar`.

Le support du **cyrillique** est assuré par les polices Google **Noto**, chargées via `next/font` avec les sous-ensembles `latin` **et** `cyrillic` :

- `Noto Sans` (variable `--font-sans`, poids 400–700) — texte courant.
- `Noto Serif` (variable `--font-serif`, normal + italique) — titres / accents éditoriaux.
- `Noto Sans Mono` (variable `--font-mono`) — code et valeurs techniques.

`display: 'swap'` et le `preload` des polices principales limitent le décalage de mise en page (CLS).

## 5.7 Design system

### Palette « Atelier »

Le design system v2 (« Atelier ») est défini dans `styles/globals.css`. Il combine une palette de teintes naturelles et un mapping sémantique en HSL consommé par Tailwind 4 (`@theme`) :

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1a1714` | Texte principal (`--foreground`) |
| `paper` | `#faf6ee` | Fond (`--background`) |
| `cream` | `#f4ede1` | Cartes, popovers (`--card`, `--accent`) |
| `sand` | `#e8ddc8` | Surfaces secondaires (`--muted`) |
| `terre` | `#a8542a` | Couleur primaire (`--primary`) |
| `olive` | `#5e6b3a` | Couleur secondaire (`--secondary`) |
| `muted` | `#8a7f6f` | Texte atténué (`--muted-foreground`) |
| `line` | `#d9cfba` | Bordures (`--border`, `--input`) |

Les tokens hex bruts sont la source de vérité ; ils sont remappés en variables HSL sémantiques (`--primary`, `--secondary`, `--destructive`, etc.) pour être utilisés via `hsl(var(--x))`. Un thème sombre est défini en CSS mais n'est pas activé côté UI à ce jour.

### Primitives UI

Les composants de base sont dans `components/ui/` : `button`, `card`, `dialog`, `dropdown-menu`, `input`, `select`, `sheet`, `skeleton`, `tabs`, `textarea`, `avatar`, `badge`, `alert`, plus des helpers (`AppLink`, `EmptyState`, `ErrorState`, `PageHeader`, `SkeletonGrid`, `InteractiveCard`). Les icônes proviennent de `lucide-react`.

## 5.8 Pages principales

| Route | Auth | Source de données | Description |
|-------|------|-------------------|-------------|
| `/` | publique | `/listings` (récentes), catégories | Accueil : hero, grille de catégories, annonces récentes, CTA |
| `/listings` | publique | `/listings` (filtres + recherche) | Liste/recherche d'annonces |
| `/listings/[id]` | publique | `/listings/:id` | Détail d'annonce + offres + contact |
| `/listings/create` | **protégée** | POST `/listings` | Création (email vérifié requis) |
| `/offerers` | publique | `/users/providers` | Annuaire des prestataires |
| `/categories/[slug]` | publique | `/listings?category=` | Page SEO catégorie |
| `/villes/[slug]` | publique | `/listings?location=` | Page SEO ville |
| `/u/[id]` | publique | `/users/:id/public` | Profil public prestataire |
| `/messages` | **protégée** | `/messages/threads`, `/messages/with/:id` | Messagerie |
| `/notifications` | protégée | `/notifications` | Centre de notifications |
| `/reviews/create` | protégée | POST `/reviews` | Déposer un avis (après complétion) |
| `/dashboard` | **protégée** | divers | Tableau de bord (favoris, zones, KYC) |
| `/dashboard/favorites` | protégée | `/favorites/*` | Favoris |
| `/dashboard/service-zones` | protégée | `/users/service-zones` | Zones de service |
| `/dashboard/verification` | protégée | `/users/verification/*` | KYC côté utilisateur |
| `/profile` (+ `/informations`, `/identifiants`, `/demandes`, `/notifications`) | protégée | `/auth/me`, `/users/me/*` | Profil et sous-pages |
| `/onboarding` | protégée | `/users/onboarding` | Parcours post-inscription |
| `/verify-email` | publique | POST `/auth/verify-email` | Validation d'email via token |
| `/reset-password` | publique | POST `/auth/reset-password` | Réinitialisation |
| `/settings/security` | **protégée** | *(**À venir : US-A4**)* `/users/me/auth-methods` | Gestion unifiée des méthodes d'auth |
| `/admin` (+ `/users`, `/listings`, `/reports`, `/verification`) | **admin** | `/admin/*` | Back-office |
| `/cgu`, `/confidentialite` | publique | statique | Pages légales |
| `/api/auth/[...nextauth]` | — | NextAuth | Handlers OAuth |

**Protection des routes (middleware Next.js, `src/middleware.ts`).** Le middleware lit le token NextAuth et applique :

- `/admin/*` : exige un token **et** `adminRole ∈ {ADMIN, MODERATOR}` (sinon redirection).
- `/dashboard/*`, `/messages/*`, `/listings/create`, `/offers/*`, `/settings/*` : exigent un token (sinon redirection vers `/auth/login` avec `callbackUrl`).

## 5.9 Performance

- **Server Components par défaut** : moins de JavaScript envoyé au client, meilleur TTFB.
- **`next/image`** : optimisation et formats modernes, *thumbnails* générées côté API par `sharp`.
- **Pagination systématique** des listes (annonces, offres, messages, notifications) pour limiter le volume transféré.
- **Polices `swap` + preload**, **carrousel** léger (`embla`), **`@next/bundle-analyzer`** disponible pour surveiller la taille des bundles.
- Travail dédié sur les **Core Web Vitals** (US-45).

## 5.10 Tests E2E (Playwright)

Le frontend est couvert par **Playwright** (`apps/web/e2e/`). Les parcours critiques :

| Fichier | Parcours |
|---------|----------|
| `flow1-auth.spec.ts` | Inscription / connexion |
| `flow2-listing.spec.ts` | Publication et consultation d'annonce |
| `flow3-message.spec.ts` | Échange de messages |
| `flow4-offer.spec.ts` | Cycle d'offre |
| `phone-auth.spec.ts` | Authentification téléphone (Firebase) |
| `security-banner.spec.ts` | *(**À venir : US-A4**)* bannière d'amélioration de sécurité |

Ces tests sont exécutés en CI après le démarrage de l'API (voir §9.6). Un test unitaire (`__tests__`) couvre l'i18n.
