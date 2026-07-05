# Annexes

## Annexe A — Glossaire complet

| Terme | Définition |
|-------|------------|
| **App Router** | Modèle de routage de Next.js basé sur le dossier `app/`, avec Server Components par défaut. |
| **bcrypt** | Algorithme de hachage de mots de passe (10 *rounds* ici). |
| **CT / LXC** | Conteneur Linux léger sur Proxmox. CT 101 = Caddy, CT 200 = application. |
| **Caddy** | Reverse proxy avec HTTPS automatique (Let's Encrypt). |
| **cuid** | Identifiant unique collision-résistant utilisé comme clé primaire. |
| **DNAT** | *Destination NAT* — redirige le trafic 80/443 public vers le conteneur Caddy. |
| **E.164** | Format international de numéro de téléphone (`+976XXXXXXXX` en Mongolie). |
| **EmailService** | Wrapper applicatif autour de Resend (envoi, *gating*, dégradation gracieuse). |
| **Guard** | Composant NestJS d'autorisation exécuté avant un *handler* (JWT, rôles, ownership…). |
| **IDOR** | *Insecure Direct Object Reference* — faille d'accès à la ressource d'autrui ; contrée par les ownership guards. |
| **JWT** | *JSON Web Token* — jeton de session signé, transporté en cookie `httpOnly`. |
| **KYC** | Vérification d'identité (*Know Your Customer*). |
| **LVM-thin** | Stockage à provisionnement fin permettant les snapshots LXC. |
| **MASQUERADE** | Règle NAT faisant sortir le trafic privé via l'IP publique. |
| **MNT** | Tugrik mongol (devise) — unité des prix. |
| **Monorepo** | Dépôt unique regroupant plusieurs apps/packages (ici via pnpm + Turbo). |
| **NextAuth** | Bibliothèque d'authentification côté Next.js (gère le handshake OAuth). |
| **Noto** | Famille de polices Google couvrant le cyrillique (Sans, Serif, Mono). |
| **Offre (offer)** | Proposition chiffrée d'un prestataire sur une annonce. |
| **Onboarding** | Parcours guidé post-inscription. |
| **Prisma** | ORM TypeScript (schéma, migrations, client généré). |
| **Proxied (Cloudflare)** | Mode où Cloudflare relaie le trafic et masque l'IP d'origine. |
| **RBAC** | Contrôle d'accès basé sur les rôles (`UserRole`, `AdminRole`). |
| **Resend** | Service d'emails transactionnels. |
| **Server Component** | Composant React rendu côté serveur (pas de JS client). |
| **Soft delete** | Suppression logique via `deletedAt`. |
| **Tailscale** | VPN mesh pour l'accès admin privé. |
| **TanStack Query** | Bibliothèque de gestion de données distantes côté client (cache, polling). |
| **Throttle** | Limitation de débit (rate limiting) par endpoint. |
| **tsvector / tsquery** | Types PostgreSQL pour la recherche plein-texte (config `simple`). |
| **Turborepo** | Orchestrateur de tâches monorepo (cache de build incrémental). |
| **Zone de service** | Ville/district où opère un prestataire (`ServiceZone`). |

## Annexe B — Variables d'environnement complètes

### API (`apps/api/.env`)

| Variable | Requis | Défaut | Description |
|----------|--------|--------|-------------|
| `NODE_ENV` | non | `development` | `development` / `production` / `test` |
| `PORT` | non | `3310` | Port d'écoute de l'API |
| `DATABASE_URL` | **oui** | — | URL PostgreSQL (validée comme URL) |
| `JWT_SECRET` | **oui** | — | Secret de signature JWT (≥ 16 caractères) |
| `JWT_EXPIRES_IN` | non | `7d` | Durée de validité du JWT |
| `CORS_ORIGIN` | **oui** | — | Origine autorisée (ex. `https://tusch.mn`) |
| `FRONTEND_URL` | non | `http://localhost:3000` | Base des liens dans les emails |
| `COOKIE_DOMAIN` | non | — | Domaine du cookie (ex. `.tusch.mn`) |
| `FIREBASE_PROJECT_ID` | conditionnel | — | Requis avec les autres `FIREBASE_*` |
| `FIREBASE_CLIENT_EMAIL` | conditionnel | — | Compte de service Firebase |
| `FIREBASE_PRIVATE_KEY` | conditionnel | — | Clé privée (les `\n` sont normalisés) |
| `RESEND_API_KEY` | conditionnel | — | Doit commencer par `re_` ; active l'email |
| `RESEND_FROM_EMAIL` | conditionnel | — | Requis si `RESEND_API_KEY` est défini |
| `RESEND_FROM_NAME` | non | `Tusch` | Nom d'expéditeur |
| `METRICS_API_KEY` | non | — | Protège l'endpoint `/metrics` |

*Règles Zod : les trois `FIREBASE_*` sont requis ensemble ou absents ; `RESEND_FROM_EMAIL` devient requis si `RESEND_API_KEY` est posé.*

### Web (`apps/web/.env`)

| Variable | Requis | Description |
|----------|--------|-------------|
| `NEXT_PUBLIC_API_URL` | **oui** | URL de l'API (ex. `https://api.tusch.mn`) |
| `NEXTAUTH_URL` | **oui** | URL publique du site |
| `NEXTAUTH_SECRET` | **oui** | Secret NextAuth (≥ 32 caractères) |
| `GOOGLE_CLIENT_ID` | non | OAuth Google |
| `GOOGLE_CLIENT_SECRET` | non | OAuth Google |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | non | Auth téléphone (client) |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | non | Auth téléphone (client) |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | non | Auth téléphone (client) |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | non | Auth téléphone (client) |
| `TEST_BASE_URL` / `TEST_API_URL` | non | Tests Playwright |

## Annexe C — Cheat sheet (commandes)

```bash
# ── Développement (racine du monorepo) ──
pnpm install                      # installer
pnpm dev                          # lancer web + api
pnpm -w lint                      # lint global
pnpm -w typecheck                 # typecheck global
pnpm -w build                     # build global
pnpm smoke                        # build + e2e api + unit api

# ── Base de données (Prisma) ──
pnpm -C apps/api prisma generate
pnpm -C apps/api prisma migrate dev      # créer une migration (dev)
pnpm -C apps/api prisma migrate deploy   # appliquer (prod)
pnpm -C apps/api prisma migrate status
pnpm -C apps/api prisma db seed          # seed full-text (dev)

# ── Tests ──
pnpm --filter api test            # unit API
pnpm --filter api test:e2e        # e2e API
pnpm --filter web test:e2e        # Playwright

# ── Serveur (Proxmox / CT) ──
pct list ; pct enter 200
pct snapshot 200 <nom> ; pct rollback 200 <nom>
systemctl status tusch-api tusch-web
journalctl -u tusch-api -f
caddy validate --config /etc/caddy/Caddyfile ; systemctl reload caddy
pg_dump -U tusch_app tusch_prod > backup.sql
```

## Annexe D — Liens utiles

| Ressource | URL |
|-----------|-----|
| Swagger API (local) | `http://localhost:3310/api/docs` |
| Hetzner Robot | https://robot.hetzner.com |
| Hetzner Docs | https://docs.hetzner.com |
| Proxmox VE Docs | https://pve.proxmox.com/wiki/Main_Page |
| Cloudflare Dashboard | https://dash.cloudflare.com |
| Tailscale admin | https://login.tailscale.com/admin |
| Resend | https://resend.com |
| Firebase Console | https://console.firebase.google.com |
| Let's Encrypt | https://letsencrypt.org |
| Test SSL Labs | https://www.ssllabs.com/ssltest/ |

*Accès admin Proxmox via Tailscale : `https://100.68.52.59:8006` (port 8006 fermé au public).*

## Annexe E — Historique des migrations Prisma

| # | Migration | Date |
|---|-----------|------|
| 1 | `init` | 2025-05-23 |
| 2 | `rename_table` | 2025-05-23 |
| 3 | `add_password_to_user` | 2025-06-10 |
| 4 | `add_user_fields` | 2025-06-12 |
| 5 | `init_listing` | 2025-11-12 |
| 6 | `add_user_listing_relation` | 2025-11-12 |
| 7 | `avatar_url` | 2025-12-11 |
| 8 | `add_listing_category` | 2025-12-17 |
| 9 | `add_listing_images` | 2025-12-18 |
| 10 | `remove_listing_title` | 2025-12-19 |
| 11 | `add_messqges` | 2025-12-31 |
| 12 | `relation_message_and_listing` | 2025-12-31 |
| 13 | `add_user_role` | 2026-01-06 |
| 14 | `admin_moderation` | 2026-01-11 |
| 15 | `add_reviews` | 2026-01-15 |
| 16 | `reset_token_in_user` | 2026-02-07 |
| 17 | `added_email_verified_in_user` | 2026-02-07 |
| 18 | `add_notifications` | 2026-02-13 |
| 19 | `add_soft_deletes` | 2026-02-13 |
| 20 | `add_reports_system` | 2026-02-13 |
| 21 | `add_thumbnail_url` | 2026-02-16 |
| 22 | `add_offers` | 2026-02-23 |
| 23 | `add_offer_response_notifications` | 2026-02-23 |
| 24 | `add_favorites` | 2026-02-24 |
| 25 | `add_offer_completed` | 2026-02-24 |
| 26 | `add_admin_role` | 2026-03-19 |
| 27 | `add_onboarding_fields` | 2026-03-19 |
| 28 | `add_review_offer_link` | 2026-03-20 |
| 29 | `add_kyc_verification` | 2026-03-23 |
| 30 | `add_service_zones` | 2026-03-26 |
| 31 | `add_fulltext_search` | 2026-04-05 |
| 32 | `add_accepted_terms` | 2026-04-05 |
| 33 | `add_phone_auth_fields` | 2026-05-20 |
| 34 | `add_email_notification_preferences` | 2026-05-20 |

*(34 migrations applicatives + `migration_lock.toml` ; le décompte « 35 » du dossier inclut le fichier de verrou.)*

## Annexe F — Changelog des US accomplies

| Lot | US | Sujet |
|-----|----|----|
| **Hardening** | US-30 | Correction encodage i18n |
| | US-31 | Typecheck strict |
| | US-32 | Validation d'environnement (Zod) |
| | US-33 | Rate limiting |
| | US-34 | Durcissement des guards admin |
| | US-35 | Nettoyage du dépôt |
| **Features** | US-36 | Notifications live (polling 30 s) |
| | US-37 | Assistant d'onboarding |
| | US-38 | Avis post-complétion |
| | US-39 | UX des favoris |
| | US-40 | Vérification KYC |
| | US-41 | Zones de service |
| **Qualité / SEO / Legal** | US-42 | Tests E2E Playwright |
| | US-43 | SEO catégories + villes |
| | US-44 | Recherche plein-texte (tsvector) |
| | US-45 | Core Web Vitals |
| | US-46 | Pages légales (CGU, confidentialité) |
| **Refactoring** | US-49 | Quick wins P0 (sécurité token, typage Prisma) |
| | US-50 | Refactor backend P1 (split services, i18n notifs) |
| | US-51 | Refactor frontend P1 (split composants, hooks) |
| | US-52 | Nettoyage P2 (ErrorBoundary, tests, audit types) |
| **Design System v2** | US-53 | Tokens + polices Noto + composants atomiques (« Atelier ») |
| | US-54 | Refonte de la page d'accueil |
| **Auth téléphone** | US-A1 | Setup Firebase Admin + champs phone |
| | US-A2 | Endpoints phone (login / link / unlink) |
| | US-A3 | UI d'authentification téléphone |
| **Email** | US-E1 | Setup Resend + EmailService |
| | US-E2 | Templates React Email + flows verify/reset |
| | US-E3 | Notifications transactionnelles (6 événements + préférences) |
| **Sécurité (compte)** | US-A4 | Page `/settings/security` unifiée + bannière + endpoint auth-methods — *à venir, non mergé sur `dev`* |
