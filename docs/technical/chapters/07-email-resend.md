# Chapitre 7 — Email transactionnel (Resend)

## 7.1 Choix de Resend

Tusch envoie ses emails transactionnels via **[Resend](https://resend.com)**. Les raisons : un palier gratuit confortable (**3 000 emails/mois, 100/jour**, sans carte bancaire), le support des **templates React Email**, une bonne délivrabilité et un SDK simple. Le code n'importe jamais `resend` directement : tout passe par un `EmailService` qui encapsule le SDK, ce qui rend le service débranchable et testable.

## 7.2 Configuration DNS Cloudflare

Mise en service en une fois :

1. **Compte Resend** (gratuit, sans CB).
2. **Ajout du domaine `tusch.mn`** dans Resend (région `eu-west-1`). Resend fournit trois enregistrements DNS : **SPF**, **DKIM**, **MX**.
3. **DNS dans Cloudflare** : ajouter les trois enregistrements exactement tels que fournis. **Important** : passer le nuage orange → gris (DNS only) sur chaque enregistrement Resend pour que Cloudflare **ne proxie pas** ces entrées (Resend doit voir les vraies valeurs).
4. **Vérification** dans Resend (Domains → Verify) — propagation typiquement 1–5 min.
5. **Clé API** (permission *Sending access*), à copier immédiatement (affichée une seule fois).

## 7.3 EmailService

Variables d'environnement (côté API) :

```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@tusch.mn
RESEND_FROM_NAME=Tusch
```

Le schéma Zod (`config/env.schema.ts`) impose : `RESEND_API_KEY` doit commencer par `re_` ; `RESEND_FROM_EMAIL` devient **requis** si la clé est présente ; `RESEND_FROM_NAME` vaut `Tusch` par défaut.

**Dégradation gracieuse.** L'absence de `RESEND_API_KEY` est **autorisée** : l'app démarre normalement, chaque appel `emailService.send()` devient un *no-op* journalisé (`[email-skipped]`). C'est le comportement attendu en développement et en CI (aucun email réel envoyé). `isEnabled()` reflète cet état.

## 7.4 Templates React Email

Les templates vivent dans `apps/api/src/modules/email/templates/`. Quatre composants React Email couvrent l'ensemble des cas (un layout partagé + un template générique de notification réutilisé pour les six événements métier) :

| Composant | Usage |
|-----------|-------|
| `EmailLayout.tsx` | Mise en page commune (en-tête, pied, charte) |
| `VerifyEmailTemplate.tsx` | Vérification d'email (US-E2) |
| `PasswordResetTemplate.tsx` | Réinitialisation de mot de passe (US-E2) |
| `NotificationEmail.tsx` | Template paramétré pour les notifications métier (US-E3) |

Logiquement, cela couvre **8 types d'emails** : 2 liés à l'authentification (vérification, reset) et 6 notifications métier (ci-dessous).

## 7.5 Préférences utilisateur

Les préférences sont stockées sur `User.emailNotifications` (**JSONB**, défaut `{}`). Les clés manquantes retombent sur les **défauts globaux** (`packages/shared/src/notifications.ts`, `DEFAULT_EMAIL_NOTIFICATION_PREFERENCES`), ce qui évite tout *backfill* pour les comptes existants.

| Clé (`EmailNotificationKey`) | Défaut |
|------------------------------|--------|
| `newMessage` | activé |
| `newOffer` | activé |
| `offerAccepted` | activé |
| `offerRejected` | activé |
| `offerCompleted` | activé |
| `newReview` | activé |
| `listingFlagged` | activé |
| `weeklyDigest` | **désactivé** |

Helpers : `getUserEmailPref(prefs, key)` (lecture sûre avec défaut) et `mergeEmailPreferences(current, patch)` (fusion qui ignore les clés inconnues et les valeurs non booléennes).

## 7.6 Page /profile/notifications

L'utilisateur gère ses préférences sur `/profile/notifications` (en mongol) : un interrupteur par type. Les emails **obligatoires** (vérification d'email, reset de mot de passe) sont documentés comme toujours actifs en bas de page. Les endpoints associés :

- `GET /users/me/email-preferences` — renvoie l'enregistrement complet avec défauts appliqués.
- `PATCH /users/me/email-preferences` — patch partiel, clés inconnues ignorées, *throttle* 10/min/utilisateur.

## 7.7 Branchement aux événements métier

Les six emails de notification (US-E3) sont déclenchés depuis les services métier :

| Déclencheur | Méthode `EmailService` | Clé de préférence |
|-------------|------------------------|-------------------|
| Message reçu | `sendNewMessageEmail` | `newMessage` |
| Nouvelle offre sur votre annonce | `sendNewOfferEmail` | `newOffer` |
| Votre offre a été acceptée | `sendOfferAcceptedEmail` | `offerAccepted` |
| Votre offre a été refusée | `sendOfferRejectedEmail` | `offerRejected` |
| Offre marquée complétée (2 parties) | `sendOfferCompletedEmail` | `offerCompleted` |
| Nouvel avis sur votre profil | `sendNewReviewEmail` | `newReview` |

Chaque envoi franchit **trois portes** dans `EmailService` :

1. Le service est configuré (clé + domaine vérifié).
2. Le destinataire a un **email vérifié** (envoyer à une adresse non vérifiée dégrade la délivrabilité).
3. L'utilisateur n'a pas désactivé ce type (préférence).

Si une porte échoue, la méthode retourne silencieusement ; un échec Resend est journalisé et **ne remonte jamais** dans le flux métier. Le helper `dispatchToUserId(userId, recipient => …)` fait en une ligne la recherche Prisma, le *gating* et le try/catch. Côté offres, on retrouve ce pattern (par ex. `dispatchToUserId(listing.userId, recipient => sendNewOfferEmail(recipient, {...}))`).

## 7.8 Anti-énumération sur forgot-password

Le flux de mot de passe oublié est volontairement **opaque** : `POST /auth/forgot-password` renvoie toujours `{ success: true }`, qu'un compte existe ou non pour l'email fourni. Le token n'est généré et l'email envoyé que si le compte existe — sans jamais révéler cette existence à l'appelant (cf. §6.7).

## 7.9 Monitoring

- **Health check** : `GET /admin/email/health` (guard `JwtAuthGuard + AdminGuard`) renvoie `{ configured, fromEmail, fromName, domain }` **sans envoyer d'email** — idéal pour un *smoke test* de production.
- **Dashboard Resend → Logs** : statut, destinataire, raison de *bounce* par envoi ; filtrable par *tag*.
- **Logs API** : `[email-sent]` / `[email-failed]` / `[email-skipped]` avec sujet et identifiant Resend.
- **Alertes** : configurer un seuil à 80 % du quota mensuel pour anticiper l'upgrade avant les *bounces* ; en cas de pic (notifications de masse), limiter côté application plutôt que de laisser Resend rejeter.

## 7.10 Ajouter un nouveau type d'email

1. Étendre `EmailNotificationKey` dans `packages/shared/src/notifications.ts` et ajouter le défaut.
2. Ajouter une méthode `sendXxxEmail(to, params)` à `EmailService` déléguant à `sendNotification(...)`.
3. L'appeler depuis le service métier via `dispatchToUserId(userId, recipient => …)`.
4. Ajouter une ligne au tableau §7.7 et l'interrupteur correspondant sur `/profile/notifications`.

*Réf. `docs/email.md` (setup détaillé US-E1/E2/E3).*
