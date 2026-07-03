# Chapitre 10 — Maintenance & Troubleshooting

## 10.1 Logs structurés

| Source | Où regarder | Contenu |
|--------|-------------|---------|
| API NestJS | `journalctl -u tusch-api -f` (via systemd) | Requêtes (LoggingInterceptor), `requestId` de corrélation, lignes email `[email-sent]` / `[email-failed]` / `[email-skipped]`, erreurs |
| Web Next.js | `journalctl -u tusch-web -f` | Sortie serveur Next.js, erreurs SSR, callbacks NextAuth |
| Caddy | `/var/log/caddy/tusch.mn.log` (+ `api.tusch.mn.log`), format **JSON** | Accès HTTP, codes, latence, TLS |
| PostgreSQL | `journalctl -u postgresql` / logs PG | Requêtes lentes, erreurs de connexion |
| Système / SSH | `journalctl`, fail2ban | Tentatives SSH, bannissements |

Le `requestId` (posé par `RequestIdMiddleware`) permet de relier les lignes de log d'une même requête de bout en bout. Les logs Caddy en JSON sont prêts pour une ingestion future par Loki/Grafana.

## 10.2 Monitoring

- **Endpoints applicatifs** : `GET /health` (santé), `GET /health/ready` (*readiness*, dépendances), `GET /metrics` (métriques applicatives, protégé par JWT+Admin et/ou `METRICS_API_KEY`). Le back-office admin (`/admin/stats`) expose des métriques métier (utilisateurs, annonces, messages, avis).
- **Email** : `GET /admin/email/health` confirme la configuration Resend sans envoyer d'email ; le dashboard Resend trace chaque envoi.
- **À venir** : *Sentry* (suivi d'erreurs) est envisagé mais non intégré. La stack *Prometheus + Grafana + Loki* est prévue côté infra (lab) mais non déployée pour l'app. SSL Labs sert de contrôle ponctuel TLS (score A+).

## 10.3 Commandes utiles

### Proxmox / système

```bash
pveversion                       # version Proxmox
pct list                         # lister les conteneurs LXC
pct enter 200                    # entrer dans CT 200 (app)
pct snapshot 200 <nom>           # snapshot d'un conteneur
pct rollback 200 <nom>           # restaurer un snapshot
pvesm status                     # état des storages (local-lvm en lvmthin)
systemctl status pve-firewall    # firewall Proxmox
iptables -t nat -L POSTROUTING -n -v   # vérifier le NAT MASQUERADE
```

### PostgreSQL

```bash
sudo -u postgres psql -d tusch_prod          # console SQL
pg_dump -U tusch_app tusch_prod > backup.sql # sauvegarde
psql -U tusch_app tusch_prod < backup.sql    # restauration
VACUUM ANALYZE;                              # maintenance / stats planificateur
```

### Caddy

```bash
caddy validate --config /etc/caddy/Caddyfile  # valider la config
systemctl reload caddy                        # recharger sans coupure
journalctl -u caddy -f                        # suivre les logs
```

### Node / pnpm / Prisma

```bash
pnpm -w build                                 # build complet
pnpm -C apps/api prisma migrate status        # état des migrations
pnpm -C apps/api prisma migrate deploy        # appliquer (prod)
pnpm -C apps/api prisma studio                # explorateur DB (dev)
pnpm --filter api test:e2e                    # tests e2e API
```

## 10.4 Débogage courant

| Symptôme | Cause probable | Diagnostic / résolution |
|----------|----------------|-------------------------|
| **502 Bad Gateway** | Service applicatif arrêté ou mauvais port | `systemctl status tusch-api tusch-web` ; vérifier que l'app écoute (3000/3310) ; consulter `journalctl -u tusch-api` ; redémarrer |
| **Email non envoyé** | Resend non configuré, email destinataire non vérifié, ou préférence désactivée | `GET /admin/email/health` ; chercher `[email-skipped]`/`[email-failed]` dans les logs ; vérifier le dashboard Resend (bounces, DNS DKIM) |
| **OTP téléphone en échec / timeout** | Credentials Firebase manquants, reCAPTCHA, quota SMS | Logs : message « *Firebase credentials not set* » ⇒ env manquant ; vérifier reCAPTCHA côté web ; en dev, utiliser les numéros de test Firebase |
| **Lenteur DB** | Index manquant, *bloat*, stats périmées | `EXPLAIN ANALYZE` sur la requête ; `VACUUM ANALYZE` ; vérifier les index (voir §3.3) ; surveiller les requêtes plein-texte |
| **Démarrage API impossible** | Variable d'environnement manquante/invalide | Le message « *Config validation error* » liste les variables fautives (Zod) ; comparer à `.env.example` |
| **Cookie de session non posé** | `CORS_ORIGIN`/`COOKIE_DOMAIN` mal réglés, `secure` en HTTP | Vérifier CORS `credentials: true`, le domaine du cookie, et que la prod est bien en HTTPS |
| **tusch.mn inaccessible après changement DNS** | Cache DNS FAI | Tester depuis un autre réseau ; forcer un résolveur public (1.1.1.1) |

## 10.5 Procédure d'incident

1. **Détection** — alerte (santé, monitoring) ou signalement utilisateur. Premier réflexe : `GET /health` et `GET /health/ready`.
2. **Diagnostic** — localiser la couche : Caddy (logs JSON) ? App (`journalctl -u tusch-api`) ? DB (`psql`, requêtes lentes) ? Réseau/firewall (Proxmox, Hetzner) ? Le `requestId` aide à tracer une requête.
3. **Mitigation** — redémarrer le service fautif ; si régression de déploiement, *rollback* code ou **snapshot LXC** (§9.7) ; si corruption DB, restaurer un `pg_dump`.
4. **Post-mortem** — consigner cause racine, impact, correctif et action préventive dans le suivi des changements du document infra (§11.4 de ce dernier). Préférer un correctif durable (test, garde-fou) à un palliatif.

## 10.6 Roadmap technique et dette connue

**À venir (fonctionnel)** :

- **US-A4** — page `/settings/security` unifiée + endpoint `auth-methods` (développé, à merger sur `dev`).
- **Déploiement** — exécution effective sur CT 200, branchement reverse proxy Caddy, sous-domaine `api.tusch.mn`, services systemd.
- **CD de production** — pipeline de déploiement automatisé (SSH deploy).
- **Backups** — `pg_dump` quotidien, Hetzner Storage Box, Proxmox Backup Server.
- **Monétisation** — non implémentée (voir §1.4).

**Dette technique identifiée** (synthèse du rapport interne, réévaluée au code courant) :

- **Versions Zod divergentes** — `zod@3` (API) vs `zod@4` (web). À aligner pour fiabiliser les schémas partagés via `@repo/shared`.
- **Cohérence linguistique des notifications** — les libellés in-app (`notification-templates.ts`) sont en **français** alors que l'UI est en mongol. À traduire.
- **Sessions JWT** — pas de *refresh token* ni de rotation ; durées cookie (24 h) et JWT (`7d`) non alignées (voir §6.6).
- **Occurrences de `any`** — concentrées dans quelques fichiers transverses (`global-exception.filter.ts`, `optional-jwt-auth.guard.ts`, `request-id.middleware.ts`, `prisma.service.ts`) et les tests. À resserrer progressivement.
- **`main` en retard** — la branche `main` n'a longtemps pas reflété l'état réel (développement sur `dev` et chaîne de branches). Établir une release stable et nettoyer les branches mortes.
- **Build** — l'erreur de type historiquement signalée sur `packages/shared/src/phone.ts` est **corrigée** dans le code courant (garde de nullité présente) ; vérifier `pnpm -w build` au vert avant tout déploiement.
- **README** — toujours le template Turborepo par défaut ; la documentation réelle vit dans `docs/` (dont le présent document) et `CLAUDE.md`.
- **Mode sombre** — défini en CSS mais non activé côté UI.
- **Avertissement Next.js 16** — convention `middleware` annoncée *deprecated* au profit de `proxy` ; à suivre lors des montées de version.
