# Chapitre 9 — Déploiement

> **État global : non encore réalisé.** Le code applicatif n'est pas déployé sur le serveur à la date de rédaction (le conteneur CT 200 dispose de Node 22 et PostgreSQL 15, mais pas du code). Ce chapitre décrit donc à la fois ce qui **existe** (CI, variables, schéma) et la procédure de déploiement **cible**. Les éléments non implémentés sont signalés « *proposition* » ou « *à venir* ».

## 9.1 Workflow de déploiement actuel (manuel)

Le déploiement cible est **manuel** pour le MVP : connexion SSH (via Tailscale, `100.68.52.59`) au conteneur CT 200, puis :

```bash
# Sur CT 200 (tusch-app-01)
cd /opt/tusch            # emplacement cible du monorepo (à définir)
git pull origin dev
pnpm install --frozen-lockfile
pnpm -C apps/api prisma generate
pnpm -C apps/api prisma migrate deploy   # voir §9.4
pnpm -w build
# redémarrage des services (voir §9.2)
sudo systemctl restart tusch-api tusch-web
```

Avant le premier déploiement, prendre un snapshot LXC (`pct snapshot 200 pre-deploy-<date>`) pour pouvoir revenir en arrière (voir §9.7).

## 9.2 Process manager (systemd) — proposition

> *Proposition : aucun fichier d'unité systemd n'est présent dans le dépôt à ce jour. Le document infra évoque « systemd ou PM2 » sans choix arrêté.*

Deux services systemd sont recommandés, un par application :

```ini
# /etc/systemd/system/tusch-api.service
[Unit]
Description=Tusch API (NestJS)
After=network.target postgresql.service

[Service]
WorkingDirectory=/opt/tusch/apps/api
ExecStart=/usr/bin/node dist/apps/api/src/main.js
Environment=NODE_ENV=production
EnvironmentFile=/opt/tusch/apps/api/.env
Restart=always
User=tusch

[Install]
WantedBy=multi-user.target
```

```ini
# /etc/systemd/system/tusch-web.service
[Unit]
Description=Tusch Web (Next.js)
After=network.target tusch-api.service

[Service]
WorkingDirectory=/opt/tusch/apps/web
ExecStart=/usr/bin/pnpm start
Environment=NODE_ENV=production
EnvironmentFile=/opt/tusch/apps/web/.env
Restart=always
User=tusch

[Install]
WantedBy=multi-user.target
```

L'API écoute sur le port `3310` (défaut), le web sur `3000`.

## 9.3 Variables d'environnement de production

| Variable (API) | Source | Criticité | Note |
|----------------|--------|-----------|------|
| `DATABASE_URL` | secret | **critique** | `postgresql://tusch_app:****@localhost:5432/tusch_prod` |
| `JWT_SECRET` | secret | **critique** | ≥ 16 caractères, validé par Zod |
| `CORS_ORIGIN` | config | **critique** | `https://tusch.mn` |
| `NODE_ENV` | config | haute | `production` |
| `JWT_EXPIRES_IN` | config | moyenne | défaut `7d` |
| `FRONTEND_URL` | config | moyenne | `https://tusch.mn` (liens dans les emails) |
| `COOKIE_DOMAIN` | config | moyenne | `.tusch.mn` (cookie inter-sous-domaines) |
| `FIREBASE_PROJECT_ID` / `_CLIENT_EMAIL` / `_PRIVATE_KEY` | secret | haute | requis ensemble (auth téléphone) |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` / `RESEND_FROM_NAME` | secret | haute | requis ensemble (emails) |
| `METRICS_API_KEY` | secret | basse | endpoint `/metrics` |

| Variable (web) | Criticité | Note |
|----------------|-----------|------|
| `NEXT_PUBLIC_API_URL` | **critique** | `https://api.tusch.mn` (à créer, voir §9.5) |
| `NEXTAUTH_URL` | **critique** | `https://tusch.mn` |
| `NEXTAUTH_SECRET` | **critique** | ≥ 32 caractères |
| `GOOGLE_CLIENT_ID` / `_SECRET` | haute | OAuth Google |
| `NEXT_PUBLIC_FIREBASE_*` (×4) | haute | auth téléphone côté client |

> **Gestion des secrets** : le document infra recommande un gestionnaire (Vaultwarden/Bitwarden/KeePass) et le stockage hors-ligne des codes 2FA. Ne jamais committer de secret. Les `.env` de production sont posés directement sur le serveur (référencés par `EnvironmentFile` dans systemd).

## 9.4 Migrations Prisma sur tusch_prod

La commande de production est **`prisma migrate deploy`** (et non `migrate dev`, qui peut générer/réinitialiser). Procédure sûre :

1. **Snapshot LXC** du conteneur (`pct snapshot 200 pre-migrate-<date>`) **et** dump PostgreSQL (`pg_dump`) avant toute migration.
2. `DATABASE_URL` pointant sur `tusch_prod`.
3. `pnpm -C apps/api prisma generate` puis `pnpm -C apps/api prisma migrate deploy`.
4. Vérifier l'état : `prisma migrate status`.

`migrate deploy` applique uniquement les migrations en attente, de façon idempotente — c'est le mode adapté à la production.

## 9.5 Caddy reverse proxy vers l'application — à venir

> *À venir : Caddy sert actuellement une page « coming soon » (voir §8.8).*

Configuration cible du `Caddyfile` :

```caddy
tusch.mn, www.tusch.mn {
    reverse_proxy 10.10.0.30:3000      # Next.js (web)
    encode gzip zstd
    header { Strict-Transport-Security "max-age=31536000; includeSubDomains" }
    log { output file /var/log/caddy/tusch.mn.log; format json }
}

api.tusch.mn {
    reverse_proxy 10.10.0.30:3310      # NestJS (API)
    log { output file /var/log/caddy/api.tusch.mn.log; format json }
}
```

Prérequis : créer l'enregistrement DNS `api.tusch.mn` dans Cloudflare (Proxied), puis `caddy validate` et `systemctl reload caddy`. Étapes complémentaires envisagées dans le doc infra : *Cloudflare Origin Certificate* (cert 15 ans) et *Authenticated Origin Pulls* (refuser tout trafic non-Cloudflare).

## 9.6 CI/CD GitHub Actions

**Existant — CI sur `dev`** (`.github/workflows/ci-dev.yml`). Déclenché sur push/PR vers `dev` et `workflow_dispatch`. Pipeline (PostgreSQL 15 en service, Node 24.13, pnpm 8.15.6) :

`install (frozen) → prisma generate → lint → typecheck → build shared → build API → migrate deploy → E2E API (runInBand) → build web → start API (background) → attente /health → install Playwright chromium → E2E web (Playwright) → upload rapport`.

**Manquant — CD de production.** Il n'existe **pas** de pipeline de déploiement automatique. *Proposition* : un workflow déclenché sur tag/release qui se connecte en SSH au serveur (clé de déploiement dédiée) et exécute la procédure §9.1, ou un *runner* auto-hébergé. À spécifier dans une US dédiée.

## 9.7 Procédure de rollback

Deux niveaux, du plus rapide au plus complet :

1. **Code applicatif** : revenir au commit précédent (`git checkout <sha>` puis rebuild + restart), ou redémarrer sur le snapshot LXC pris avant déploiement (`pct rollback 200 pre-deploy-<date>`).
2. **Base de données** : restaurer le `pg_dump` pris avant migration. Pour un retour d'état complet (code + données + système), restaurer le **snapshot LXC** — d'où l'importance d'en prendre un avant chaque opération risquée.

> Les snapshots LXC reproductibles (LVM-thin, §8.10) sont le filet de sécurité principal. La règle : **un snapshot avant toute opération sensible**.

## 9.8 Backups

> *État : non encore mis en place (sections « Sauvegardes » du doc infra à compléter).*

Stratégie cible :

- **`pg_dump` quotidien** de `tusch_prod` (cron sur CT 200), conservation glissante.
- **Hetzner Storage Box 1 To** (≈ 4 €/mois) pour les sauvegardes **off-server** chiffrées (dumps + configs critiques).
- **Proxmox Backup Server** (futur) pour les sauvegardes de conteneurs déduplicées/chiffrées, avec jobs *nightly* et test de restauration périodique.
- Sauvegarde des **configurations critiques** : `/etc/network/interfaces`, `Caddyfile`, unités systemd, `/etc/pve/firewall/*`.

## 9.9 Checklist pré-déploiement

- [ ] Snapshot LXC CT 200 (`pct snapshot 200 pre-deploy-<date>`).
- [ ] `pg_dump` de `tusch_prod`.
- [ ] `pnpm -w lint` et `pnpm -w typecheck` au vert.
- [ ] `pnpm -w build` réussi (api + web + shared).
- [ ] Variables d'environnement de production présentes et valides (le démarrage échoue sinon, validation Zod).
- [ ] `prisma migrate deploy` exécuté et `migrate status` propre.
- [ ] Services `tusch-api` / `tusch-web` redémarrés et actifs.
- [ ] `GET /health` et `GET /admin/email/health` OK.
- [ ] Caddy en `reverse_proxy` (et non page coming soon), `api.tusch.mn` résout.
- [ ] Smoke test des pages clés (`/`, `/listings`, `/listings/[id]`, `/messages`, `/admin`).
