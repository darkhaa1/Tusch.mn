# Chapitre 6 — Authentification & Sécurité

## 6.1 Vue d'ensemble des 3 méthodes

Un compte Tusch peut s'authentifier par trois facteurs indépendants, qui convergent tous vers la même session (un JWT en cookie `httpOnly`).

| Facteur | Endpoint de connexion | Rattachement | Stockage |
|---------|----------------------|--------------|----------|
| Email + mot de passe | `POST /auth/login` | `POST /auth/register` (ou 1ʳᵉ connexion OAuth) | `User.email` + `User.password` (bcrypt) |
| Téléphone (Firebase) | `POST /auth/phone/login` | `POST /auth/phone/link` | `User.phone` + `User.firebaseUid` |
| OAuth Google | `POST /auth/oauth-login` | 1ʳᵉ connexion Google (NextAuth) | `User.email` + mot de passe *placeholder* |

![Fig. 6.2 — Les trois méthodes convergent vers une session JWT unique](../diagrams/fig-6-2-auth-3-methodes.png)

*Fig. 6.2 — Vue unifiée des trois méthodes d'authentification.*

Les comptes OAuth reçoivent un mot de passe *placeholder* aléatoire (pour satisfaire la contrainte de colonne) ; il n'est jamais exposé et le changement de mot de passe le rejette (la vérification du « mot de passe actuel » échoue). Ajouter un vrai mot de passe à un compte OAuth-only est une évolution future.

## 6.2 Authentification téléphone (Firebase Auth Phone)

### Configuration Firebase

Côté **API**, trois variables d'environnement activent le facteur (toutes requises ensemble, sinon le facteur est désactivé proprement) :

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@<project>.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

Le `FirebaseService` initialise le SDK Admin dans `onModuleInit()` : si une variable manque, il journalise « *Firebase credentials not set — phone auth is disabled* » et reste désactivé (`isEnabled()` renvoie `false`). Les `\n` littéraux de la clé privée (collés depuis un JSON ou une variable CI) sont convertis en vrais sauts de ligne. L'app initialise une instance nommée `tusch`.

Côté **web**, le SDK Firebase client envoie le SMS (reCAPTCHA) et requiert :

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Flux complet

![Fig. 6.1 — Flux d'authentification téléphone Firebase](../diagrams/fig-6-1-auth-phone.png)

*Fig. 6.1 — De la saisie du numéro à la session JWT.*

Le client obtient un **ID token Firebase** après vérification du code SMS, puis l'envoie à l'API. Côté serveur (`AuthService.loginOrRegisterWithPhone`) :

1. Si Firebase n'est pas configuré → `503 Service Unavailable`.
2. Le numéro est normalisé en E.164 (`normalizeMongolianPhone`) ; échec → `400`.
3. L'ID token est vérifié par le SDK Admin (`verifyIdToken`) ; échec → `401`.
4. Le `phone_number` du token doit correspondre au numéro normalisé ; sinon → `400`.
5. Recherche par `firebaseUid` ; à défaut par `phone` (rattachement d'un compte historique) ; sinon création d'un compte (`phoneVerified = true`).
6. Refus si le compte est soft-deleted, sinon signature du JWT et dépôt du cookie. Un log d'audit `PHONE_LOGIN` est émis.

### Endpoints téléphone

| Endpoint | Rôle | Erreurs notables |
|----------|------|------------------|
| `POST /auth/phone/login` | Connexion / auto-inscription | `400` numéro invalide / *mismatch*, `401` token invalide, `503` non configuré |
| `POST /auth/phone/link` | Rattacher un téléphone (authentifié) | `409` téléphone/identité déjà liés à un autre compte |
| `POST /auth/phone/unlink` | Détacher le téléphone | `400` si c'est le seul facteur d'auth |

À l'unlink, si le compte n'a pas de couple email+mot de passe, l'opération est refusée (sinon l'utilisateur n'aurait plus aucun moyen de se connecter). L'utilisateur Firebase correspondant est supprimé en *fire-and-forget*.

### Format E.164 mongol

`packages/shared/src/phone.ts` centralise la normalisation : un numéro mongol valide a **8 chiffres** commençant par **6, 7, 8 ou 9**. La fonction accepte espaces, tirets, parenthèses et un préfixe `+976`/`976` ou aucun, et renvoie la forme canonique `+976XXXXXXXX` (ou `null`, sans jamais lever d'exception). Des helpers d'affichage existent : `formatMongolianPhoneDisplay` (`+976 9911 2233`) et `maskMongolianPhone` (`+976 99 ** ** 33`, pour les écrans de confirmation).

### Numéros de test (développement)

En développement, on utilise les **numéros de test** configurés dans la console Firebase (Auth → Phone → numéros de test), qui renvoient un code OTP fixe sans envoyer de vrai SMS — utile pour les tests E2E (`phone-auth.spec.ts`) et l'itération locale sans consommer de quota.

## 6.3 OAuth Google

Le handshake OAuth est géré côté Next.js par **NextAuth** (`apps/web/src/app/api/auth/[...nextauth]/route.ts`, variables `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`). Après connexion Google, un composant `AuthSync` transmet le profil à `POST /auth/oauth-login`. Côté API, `AuthService.oauthLogin` fait un **upsert sur l'email** : mise à jour du profil (prénom, nom, avatar, `emailVerified = true`) ou création avec un mot de passe *placeholder* et `phone = null` (écrire `''` provoquerait une collision sur la contrainte d'unicité au second compte). Le JWT est ensuite déposé.

> **Vigilance** : tout nouveau fournisseur OAuth doit exposer un **email vérifié**, car l'upsert se fait sur `email` — un fournisseur sans email vérifié entrerait en collision avec des comptes créés manuellement.

## 6.4 Email / mot de passe + vérification + reset

**Inscription** (`register`) : hash bcrypt (10 *rounds*), création d'un token de vérification d'email (32 octets aléatoires, **haché en SHA-256** avant stockage, expiration 24 h), `acceptedTermsAt` posé, puis envoi *best-effort* de l'email de vérification.

**Vérification d'email** (`verify-email`) : le token brut reçu est haché et comparé ; s'il correspond et n'a pas expiré, `emailVerified = true` et les champs de token sont effacés.

**Mot de passe oublié** (`forgot-password`) : voir §6.7 (anti-énumération). Le token de reset (32 octets, haché SHA-256, **expiration 1 h**) est stocké, et un email de reset est envoyé *best-effort*.

**Reset** (`reset-password`) : le token est haché, recherché avec contrainte d'expiration (`resetTokenExp > now`), le nouveau mot de passe est hashé (bcrypt 10) et les champs de token effacés.

**Changement de mot de passe** (authentifié) : vérification du mot de passe actuel (bcrypt) avant remplacement.

## 6.5 Page /settings/security unifiée

> **À venir : US-A4 (non mergé sur `dev`).** Cette section décrit une fonctionnalité développée mais pas encore présente sur la branche `dev`.

US-A4 introduit une page `/settings/security` unique pour inspecter et modifier les facteurs d'authentification, alimentée par `GET /users/me/auth-methods` :

```json
{
  "email": { "value": "darkhaa@example.com", "verified": true },
  "phone": { "value": "+97699112233", "verified": true },
  "hasPassword": true,
  "canUnlinkEmail": true,
  "canUnlinkPhone": true
}
```

**Anti-IDOR** : la route ne lit **que** l'utilisateur du JWT (aucun paramètre `:id`). Les drapeaux `canUnlinkEmail`/`canUnlinkPhone` ne valent `true` que si retirer le facteur laisse au moins un moyen de connexion (l'email seul, sans mot de passe, ne compte pas comme méthode de connexion). Ils sont **appliqués côté serveur** ; l'UI ne fait que refléter l'affordance. Une `SecurityImprovementBanner` invite l'utilisateur à compléter sa sécurité. *(Réf. `docs/auth-methods.md`.)*

## 6.6 Sessions JWT

- **Émission** : à la connexion (toutes méthodes), `JwtService.signAsync` signe `{ sub, email, adminRole }` avec `JWT_SECRET` (≥ 16 caractères, validé par Zod) ; durée `JWT_EXPIRES_IN` (défaut `7d`).
- **Transport** : cookie `accessToken` avec `httpOnly: true`, `sameSite: 'lax'`, `secure: true` en production, `maxAge` 24 h, `path: '/'`, et `domain` optionnel (`COOKIE_DOMAIN`, ex. `.tusch.mn` pour partager le cookie entre sous-domaines).
- **Lecture** : la stratégie Passport-JWT (`JwtAuthGuard`) extrait et valide le token à chaque requête protégée.
- **Déconnexion** : `POST /auth/logout` efface le cookie (`maxAge: 0`).

> *Note : la durée du cookie (24 h) et celle du JWT (`7d` par défaut) ne sont pas alignées ; le cookie expire avant le token. Il n'y a pas de mécanisme de *refresh token* ni de rotation de session à ce stade — c'est une évolution possible (voir §10.6).*

## 6.7 Sécurité applicative

- **Anti-IDOR (ownership).** Les `OwnershipGuard` (`ListingOwnershipGuard`, `OfferOwnershipGuard`) garantissent qu'on ne peut agir que sur ses propres ressources. Les endpoints « me » lisent toujours l'utilisateur via le JWT, sans paramètre d'id.
- **RBAC.** `UserRole` régit les capacités métier (qui peut faire une offre) ; `AdminRole` régit l'administration (`RolesGuard` + `@Roles`). Le back-office est intégralement protégé.
- **Rate limiting.** Quotas par endpoint sensible (voir §4.4) ; particulièrement strict sur l'authentification (5/min), le reset (3/15 min) et le KYC (3/jour).
- **Audit log.** `AdminActionLog` + `AuditService.log()` tracent les actions sensibles (ex. `PHONE_LOGIN`, `PHONE_LINK`, `PHONE_UNLINK`, et les actions de modération admin) avec acteur, type/identifiant de cible et métadonnées.
- **Anti-énumération (forgot-password).** `forgotPassword` renvoie **toujours** `{ success: true }`, que l'email existe ou non : impossible de savoir si une adresse est enregistrée. Le token n'est généré et l'email envoyé que si le compte existe réellement.
- **Hachage des tokens.** Les tokens de vérification d'email et de reset ne sont **jamais** stockés en clair (SHA-256), avec expiration courte (24 h / 1 h).
- **Sanitisation des sorties.** `sanitizeUser()` retire systématiquement `password`, `resetToken(+exp)`, `emailVerifyToken(+exp)` et `firebaseUid` des réponses.
- **Validation d'environnement stricte.** `config/env.schema.ts` (Zod) refuse le démarrage si une variable critique manque ou est invalide : `DATABASE_URL` (URL valide), `JWT_SECRET` (≥ 16 car.), `CORS_ORIGIN`. Règles conditionnelles : les trois variables Firebase sont requises ensemble ou absentes ; `RESEND_FROM_EMAIL` devient requis si `RESEND_API_KEY` est défini ; `RESEND_API_KEY` doit commencer par `re_`.
- **Limite de payload.** Body parsers plafonnés à 10 Mo (protection contre les corps abusifs) ; uploads d'images encadrés par multer + `sharp`.

## 6.8 Sécurité infrastructure

La sécurité ne s'arrête pas à l'application : une **défense en profondeur** est mise en œuvre au niveau réseau et système (firewall Hetzner amont, durcissement SSH par clés + fail2ban, accès admin via Tailscale, firewall Proxmox, TLS Let's Encrypt via Caddy). L'ensemble est détaillé au **chapitre 8** (§8.5 en particulier).
