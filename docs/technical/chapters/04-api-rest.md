# Chapitre 4 — API REST (NestJS)

## 4.1 Conventions de design

**Bootstrap.** Le point d'entrée `apps/api/src/main.ts` configure l'application Express sous-jacente : `trust proxy` à 1 (pour récupérer l'IP cliente réelle derrière Cloudflare/Caddy via `X-Forwarded-For`), parseurs body JSON/urlencoded (limite 10 Mo), `cookie-parser`, en-tête `Content-Type: application/json; charset=utf-8` forcé, service des fichiers statiques sur `/uploads`, CORS avec `credentials: true` et origine `CORS_ORIGIN`.

**Validation.** Un `ValidationPipe` global est appliqué avec `whitelist: true` (les champs non déclarés dans le DTO sont supprimés) et `transform: true` (coercition de types). Tous les corps de requête passent par des DTO décorés avec `class-validator`.

**Format de réponse.** Les réponses sont des objets JSON simples. Les ressources « utilisateur » sont systématiquement passées par `sanitizeUser()` qui retire les champs sensibles. Les listes paginées suivent le format `{ items, total, page, limit }`.

**Erreurs.** Deux filtres globaux normalisent les erreurs : `ThrottlerExceptionFilter` (dépassement de quota) et `GlobalExceptionFilter` (toutes les autres). Voir §4.5.

**Versioning.** L'API n'utilise pas de préfixe de version d'URL global au niveau NestJS ; le client web cible `…/api/v1` via sa variable d'environnement (`TEST_API_URL=http://localhost:3310/api/v1` en test). Le contrat de référence reste Swagger (`/api/docs`).

## 4.2 Structure modulaire

L'API est découpée en **modules de domaine** sous `apps/api/src/modules/`. Le module racine (`AppModule`) importe la configuration (`ConfigModule` global avec validation Zod de l'environnement), le `ThrottlerModule`, le `ServeStaticModule`, et l'ensemble des modules métier.

| Module | Responsabilité |
|--------|----------------|
| `health` | Sondes de santé / *readiness* |
| `metrics` | Métriques applicatives (protégé) |
| `firebase` | SDK Firebase Admin (vérification des ID tokens téléphone) |
| `email` | `EmailService` (Resend) + templates React Email |
| `auth` | Inscription, connexion, OAuth, téléphone, JWT, vérification email, reset |
| `audit` | Journalisation des actions sensibles (`AdminActionLog`) |
| `user` | Profil, onboarding, KYC, zones de service, providers, profil public, préférences email |
| `listings` | CRUD annonces, images, recherche plein-texte |
| `favorites` | Favoris (annonces + prestataires) |
| `messages` | Messagerie |
| `admin` | Back-office (stats, modération, KYC, santé email) |
| `reviews` | Avis |
| `notifications` | Notifications in-app |
| `offers` | Offres et cycle de vie |
| `reports` | Signalements |

## 4.3 Modules clés en détail

> Conventions des tables d'endpoints : la colonne **Auth** indique le(s) guard(s) ; *public* = aucune authentification requise ; *optional* = `OptionalJwtAuthGuard` (réponse enrichie si connecté).

### Module `auth`

**Responsabilité** : tous les flux d'authentification et de gestion du compte. Détail des flux au chapitre 6.

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| POST | `/auth/register` | public | 5/min | Inscription email + mot de passe (envoie l'email de vérification) |
| POST | `/auth/login` | public | 5/min | Connexion email + mot de passe (dépose le cookie JWT) |
| GET | `/auth/me` | JWT | — | Profil de l'utilisateur courant |
| PATCH | `/auth/me` | JWT | — | Mise à jour profil + avatar (multipart) |
| POST | `/auth/logout` | — | — | Efface le cookie |
| PATCH | `/auth/password` | JWT | — | Changement de mot de passe |
| DELETE | `/auth/me` | JWT | — | Suppression de compte (soft delete) |
| POST | `/auth/forgot-password` | public | 3/15min | Demande de reset (anti-énumération) |
| POST | `/auth/reset-password` | public | 3/15min | Reset via token |
| POST | `/auth/verify-email` | public | — | Vérification d'email via token |
| POST | `/auth/resend-verification` | JWT | 2/min | Renvoi de l'email de vérification |
| POST | `/auth/oauth-login` | public | — | Connexion OAuth (handshake NextAuth) |
| POST | `/auth/phone/login` | public | 10/min | Connexion/inscription via ID token Firebase |
| POST | `/auth/phone/link` | JWT | 5/min | Rattacher un téléphone vérifié |
| POST | `/auth/phone/unlink` | JWT | 5/min | Détacher le téléphone (refusé si seul facteur) |

**DTO principaux** : `AuthDto` (register), `LoginDto`, `OAuthLoginDto`, `ChangePasswordDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `VerifyEmailDto`, `PhoneLoginDto`, `LinkPhoneDto`, `UnlinkPhoneDto`, `UpdateProfileDto`.

**Logique notable** : tokens email/reset hachés en SHA-256 avant stockage (jamais en clair) ; envoi d'email « best-effort » (un échec SMTP ne bloque jamais le flux) ; en environnement non-production, le token brut est renvoyé dans la réponse pour faciliter les tests.

### Module `user`

**Responsabilité** : profil étendu, onboarding, KYC, zones de service, annuaire des prestataires, profil public, préférences email.

| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| GET | `/users/me/auth-methods` | JWT | *(**À venir : US-A4**, non mergé sur `dev`)* Snapshot des méthodes d'auth |
| GET | `/users/me/email-preferences` | JWT | Préférences email (défauts appliqués) |
| PATCH | `/users/me/email-preferences` | JWT (10/min) | Mise à jour partielle des préférences |
| GET | `/users` | JWT | (usage interne/admin léger) |
| GET | `/users/me` | JWT | Profil étendu |
| PATCH | `/users/me/role` | JWT | Changement de rôle (CLIENT/PROVIDER/BOTH) |
| PATCH | `/users/onboarding` | JWT | Complétion de l'onboarding |
| GET | `/users/verification/status` | JWT | État KYC |
| POST | `/users/verification/submit` | JWT (3/jour) | Soumission KYC (document) |
| PUT | `/users/service-zones` | JWT | Mise à jour des zones de service |
| GET | `/users/providers` | optional | Annuaire public des prestataires (recherche, catégorie, pagination) |
| GET | `/users/:id/service-zones` | optional | Zones d'un prestataire |
| GET | `/users/:id/public` | optional | Profil public (whitelist stricte) |

**Confidentialité** : `/users/:id/public` et `/users/providers` n'exposent **jamais** email, téléphone, mots de passe, tokens ou identifiants OAuth (cf. `docs/api-mvp-contract.md`).

### Module `listings`

**Responsabilité** : CRUD des annonces, images, recherche.

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| POST | `/listings` | JWT + EmailVerified | 10/min | Créer une annonce |
| GET | `/listings` | optional | 60/min | Lister/rechercher (filtres + plein-texte) |
| GET | `/listings/me` | JWT | — | Mes annonces |
| GET | `/listings/locations` | public | — | Localisations disponibles (facettes) |
| GET | `/listings/:id` | optional | — | Détail d'une annonce |
| PUT | `/listings/:id` | JWT + Ownership | 20/min | Modifier (propriétaire) |
| POST | `/listings/:id/images` | JWT | 10/min | Upload d'images (multer + sharp) |
| DELETE | `/listings/:id` | JWT + Ownership | — | Supprimer (soft delete) |
| DELETE | `/listings/:id/images/:imageId` | JWT | — | Supprimer une image |
| PATCH | `/listings/:id/images/reorder` | JWT | — | Réordonner les images |

**Logique notable — recherche plein-texte** (`ListingSearchService`). La chaîne de recherche est nettoyée (suppression des caractères spéciaux `tsquery`), puis une requête `$queryRaw` paramétrée combine `searchVector @@ plainto_tsquery('simple', …)` avec les filtres (catégorie, localisation `ILIKE`, fourchette de prix) et exclut les annonces masquées/supprimées et les auteurs supprimés. Le tri se fait par `ts_rank` décroissant, et un second `findMany` réhydrate les objets complets en respectant l'ordre de pertinence. Les fragments `Prisma.sql` garantissent l'absence d'injection SQL.

### Module `offers`

**Responsabilité** : création et cycle de vie des offres.

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| POST | `/offers/listing/:listingId` | JWT + EmailVerified | 15/min | Créer une offre |
| GET | `/offers/sent` | JWT | — | Offres envoyées (pagination) |
| GET | `/offers/received` | JWT | — | Offres reçues |
| GET | `/offers/listing/:listingId` | JWT | — | Offres sur une annonce |
| GET | `/offers/history` | JWT | — | Historique complété (les 2 rôles) |
| GET | `/offers/history/as-client` | JWT | — | Historique côté client |
| GET | `/offers/history/as-provider` | JWT | — | Historique côté prestataire |
| GET | `/offers/stats` | JWT | — | Statistiques d'offres |
| GET | `/offers/:id` | JWT | — | Détail d'une offre |
| PATCH | `/offers/:id/cancel` | JWT + Ownership | — | Annuler (prestataire) |
| PATCH | `/offers/:id/complete` | JWT + Ownership | — | Compléter (client) |
| PATCH | `/offers/:id/accept` | JWT + Ownership | — | Accepter (client) |
| PATCH | `/offers/:id/reject` | JWT + Ownership | — | Refuser (client) |

**Logique notable** : à la création, contrôle du rôle (`PROVIDER`/`BOTH`), interdiction d'offrir sur sa propre annonce, unicité d'une offre `PENDING` par couple (annonce, prestataire), expiration à +7 jours. Chaque transition vérifie l'état de départ (ex. seules les offres `ACCEPTED` peuvent être `COMPLETED`) et déclenche notification + email. La complétion crée une demande d'avis (`REVIEW_REQUESTED`) pour **les deux parties**.

### Module `messages`

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| GET | `/messages/unread-count` | JWT | — | Compteur de non-lus |
| POST | `/messages` | JWT + EmailVerified + ThrottleByUser | 30/min | Envoyer un message |
| GET | `/messages/with/:userId` | JWT | — | Conversation avec un utilisateur (pagination) |
| GET | `/messages/threads` | JWT | — | Liste des fils de discussion |
| PATCH | `/messages/:id/read` | JWT | — | Marquer comme lu |

### Module `reviews`

| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| POST | `/reviews` | JWT | Créer un avis (offre complétée requise) |
| GET | `/reviews/offer/:offerId/mine` | JWT | Mon avis pour une offre |
| GET | `/reviews/user/:userId` | public | Avis reçus par un utilisateur |
| DELETE | `/reviews/:id` | JWT | Supprimer son avis |

### Module `favorites`

| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| POST/DELETE | `/favorites/listings/:listingId` | JWT | Ajouter / retirer une annonce |
| GET | `/favorites/listings` | JWT | Mes annonces favorites |
| POST/DELETE | `/favorites/providers/:providerId` | JWT | Ajouter / retirer un prestataire |
| GET | `/favorites/providers` | JWT | Mes prestataires favoris |
| GET | `/favorites/check/listing/:id` | JWT | Test d'appartenance |
| GET | `/favorites/check/provider/:id` | JWT | Test d'appartenance |

### Module `notifications`

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| GET | `/notifications` | JWT | 120/min | Liste paginée |
| GET | `/notifications/unread-count` | JWT | — | Compteur de non-lus |
| PATCH | `/notifications/read-all` | JWT | — | Tout marquer lu |
| PATCH | `/notifications/:id/read` | JWT | — | Marquer une notification lue |

> **Cohérence linguistique — à corriger.** Les libellés des notifications in-app (`notification-templates.ts`) sont actuellement rédigés en **français** (« Nouvelle offre », « Offre acceptée »…), alors que l'interface est en mongol. C'est une incohérence connue à traiter (voir §10.6).

### Module `reports`

| Méthode | Path | Auth | Throttle | Description |
|---------|------|------|----------|-------------|
| POST | `/reports` | JWT | 5/min | Signaler une annonce ou un utilisateur |
| GET | `/admin/reports` | JWT (admin) | — | Lister les signalements |
| PATCH | `/admin/reports/:id` | JWT (admin) | — | Traiter un signalement |

### Module `admin`

**Responsabilité** : back-office. Le contrôleur entier est protégé par `JwtAuthGuard + AdminGuard + RolesGuard` et `@Roles(ADMIN, MODERATOR)`.

| Méthode | Path | Description |
|---------|------|-------------|
| GET | `/admin/email/health` | État de la configuration Resend (ADMIN) |
| GET | `/admin/stats` | Statistiques globales |
| GET | `/admin/users` | Lister les utilisateurs (recherche, filtre statut) |
| PATCH | `/admin/users/:id/status` | Suspendre / réactiver |
| PATCH | `/admin/users/:id/restore` | Restaurer un compte soft-deleted |
| GET | `/admin/verification` | File des KYC à traiter |
| GET | `/admin/users/:id/verification/document` | Document KYC |
| PATCH | `/admin/users/:id/verification` | Approuver / rejeter un KYC |
| GET | `/admin/listings` | Lister les annonces (recherche, filtres) |
| PATCH | `/admin/listings/:id/status` | Masquer / réafficher |
| PATCH | `/admin/listings/:id/restore` | Restaurer une annonce |

### Modules `health` / `metrics`

| Méthode | Path | Auth | Description |
|---------|------|------|-------------|
| GET | `/health` | public | Sonde de santé |
| GET | `/health/ready` | public | *Readiness* (dépendances) |
| GET | `/metrics` | JWT + Admin | Métriques applicatives |

## 4.4 Authentification & autorisation

**Session.** Les routes authentifiées s'appuient sur un JWT déposé dans un cookie `httpOnly` `accessToken` (voir §6.6). Le payload contient `sub` (id), `email` et `adminRole`.

**Guards** (`apps/api/src/common/guards/`) :

| Guard | Rôle |
|-------|------|
| `JwtAuthGuard` | Exige un JWT valide |
| `OptionalJwtAuthGuard` | Authentifie si possible, sans bloquer (réponses publiques enrichies) |
| `EmailVerifiedGuard` | Exige un email vérifié (publication d'annonce, offre, message) |
| `RolesGuard` + `@Roles(...)` | Contrôle le `adminRole` |
| `AdminGuard` | Raccourci d'accès administrateur (`isAdmin`/rôle + `status = ACTIVE`) |
| `OwnershipGuard` (`ListingOwnershipGuard`, `OfferOwnershipGuard`) | Anti-IDOR : vérifie que la ressource appartient à l'appelant |

**Rate limiting.** Les quotas sont centralisés dans `common/throttler/throttler.config.ts` et appliqués par endpoint via `@Throttle(...)`. Le `CustomThrottlerGuard` global est **désactivé en environnement de test**.

| Bucket | Limite | Endpoints |
|--------|--------|-----------|
| `AUTH_LOGIN` / `AUTH_REGISTER` | 5 / min | login, register |
| `AUTH_RESET_PASSWORD` | 3 / 15 min | forgot/reset password |
| `MESSAGES_SEND` | 30 / min | envoi de message |
| `UPLOAD` | 10 / min | upload d'images |
| `LISTINGS_CREATE` / `LISTINGS_UPDATE` | 10 / 20 par min | annonces |
| `SEARCH` | 60 / min | recherche d'annonces |
| `OFFERS_CREATE` | 15 / min | création d'offre |
| `REPORTS` | 5 / min | signalement |
| `KYC_SUBMIT` | 3 / **jour** | soumission KYC |
| `NOTIFICATIONS_GET` | 120 / min | polling notifications |
| `DEFAULT` | 100 / min | global |

## 4.5 Gestion d'erreurs

Le `GlobalExceptionFilter` capture toutes les exceptions et renvoie un format homogène (statut HTTP, message, éventuels détails de validation). Le `ThrottlerExceptionFilter` traite spécifiquement le dépassement de quota (429) avec un message normalisé. Les exceptions NestJS standard (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `ConflictException`, `NotFoundException`, `ServiceUnavailableException`) sont utilisées de façon cohérente par les services pour porter la sémantique métier (ex. `409` si un téléphone est déjà lié à un autre compte).

## 4.6 Logs structurés

Le `RequestIdMiddleware` attribue un identifiant de corrélation à chaque requête (`forRoutes('*')`). Le `LoggingInterceptor` journalise les requêtes de façon structurée et alimente le `MetricsService`. Les envois d'email émettent des lignes dédiées (`[email-sent]`, `[email-failed]`, `[email-skipped]`) facilitant le diagnostic (voir chapitre 7). Un unique `console.log` subsiste, le message de démarrage dans `main.ts`.

## 4.7 Documentation Swagger

Swagger est configuré dans `main.ts` via `DocumentBuilder` (titre « Tusch.mn API », version 1.0, schéma d'authentification *bearer* JWT nommé `JWT-auth`, et un tag par domaine). Il est exposé sur **`/api/docs`**, et la racine `/` y redirige (302). Les contrôleurs sont annotés (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBody`), ce qui fait de Swagger un contrat lisible et testable pour les intégrateurs.
