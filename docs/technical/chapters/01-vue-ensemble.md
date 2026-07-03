# Chapitre 1 — Vue d'ensemble du projet

## 1.1 Présentation et mission

Tusch.mn est une marketplace mongole de services entre particuliers. Le principe est comparable à celui d'AlloVoisins ou de TaskRabbit : un particulier qui a besoin d'un service (déménagement, ménage, réparation de plomberie, cours particuliers, garde d'enfants, etc.) publie une demande, et des prestataires intéressés répondent en faisant une offre chiffrée. La mise en relation, la négociation et le suivi de la prestation se font intégralement sur la plateforme.

Le produit s'adresse au marché mongol : l'interface est entièrement en mongol cyrillique, le domaine est `tusch.mn`, et les choix techniques (polices, optimisation mobile, conditions réseau) sont orientés vers les usages locaux. Le mot « tusch » (туслах / туш) renvoie à l'idée d'aide et d'entraide, ce qui résume la promesse du produit : trouver rapidement quelqu'un de confiance pour un service de proximité.

À la date de rédaction, le projet est un MVP fonctionnel et complet côté code : authentification multi-méthodes, publication d'annonces avec images et recherche plein-texte, cycle d'offres complet, messagerie, avis, notifications in-app et par email, modération et back-office d'administration. L'infrastructure d'hébergement (serveur dédié Hetzner sous Proxmox) est en place. Le point restant avant une mise en production publique est le déploiement effectif du code applicatif sur le serveur (voir chapitre 9).

> **Note de version.** Cette documentation décrit l'état de la branche `dev`. La fonctionnalité US-A4 (page `/settings/security` unifiée et endpoint `GET /users/me/auth-methods`) est développée mais **non encore mergée sur `dev`** au moment de la rédaction ; elle est signalée explicitement « *À venir : US-A4* » à chaque endroit concerné.

## 1.2 Modèle utilisateur (demandeur, prestataire, admin)

Le modèle est volontairement souple : il n'existe qu'une seule entité `User`, dont le rôle fonctionnel est porté par l'énumération `UserRole`.

| Rôle (`UserRole`) | Signification | Capacités principales |
|-------------------|---------------|-----------------------|
| `CLIENT` | Demandeur de service (valeur par défaut) | Publier des annonces (demandes), recevoir des offres, accepter / refuser, valider la prestation, laisser un avis |
| `PROVIDER` | Prestataire | Faire des offres sur les annonces des autres, gérer ses zones de service et catégories |
| `BOTH` | Les deux | Cumule les capacités des deux rôles |

Seuls les utilisateurs de rôle `PROVIDER` ou `BOTH` peuvent créer une offre (vérifié dans `OffersService.create()`). Un utilisateur ne peut pas faire d'offre sur sa propre annonce.

La dimension administration est portée par deux champs distincts du même modèle `User` :

- `isAdmin` (booléen) — drapeau historique.
- `adminRole` (`AdminRole` : `USER`, `MODERATOR`, `ADMIN`) — rôle d'administration effectif, utilisé par les guards (`RolesGuard`) et le middleware front. `USER` est la valeur par défaut (utilisateur non privilégié).

Un `MODERATOR` peut modérer annonces et utilisateurs et traiter les signalements et vérifications KYC ; un `ADMIN` dispose des mêmes droits avec, en plus, l'accès aux endpoints sensibles (santé email, métriques). Cette distinction est appliquée côté serveur (`@Roles(AdminRole.ADMIN, AdminRole.MODERATOR)` sur le contrôleur admin) et côté front (middleware Next.js sur `/admin`).

L'état du compte est porté par `UserStatus` (`ACTIVE` / `SUSPENDED`) : un administrateur peut suspendre un compte, ce qui déclenche une notification `ACCOUNT_SUSPENDED`.

## 1.3 Valeur ajoutée et positionnement

Le positionnement de Tusch.mn repose sur trois piliers observables dans le code :

1. **Confiance.** Plusieurs mécanismes de réputation sont implémentés : avis vérifiés (un avis ne peut être déposé qu'après une offre réellement *complétée*, contrainte d'unicité `(reviewerId, offerId)`), vérification d'identité KYC (`verificationStatus`), et signalements (`Report`). Le profil public d'un prestataire agrège note moyenne, nombre d'avis et nombre d'annonces.
2. **Adaptation au marché mongol.** Interface 100 % cyrillique, polices Noto avec sous-ensemble cyrillique, conception mobile-first (barre de navigation basse `BottomNav`), villes et districts mongols intégrés en dur dans le package partagé.
3. **Mise en relation structurée.** Contrairement à un simple annuaire, le flux « annonce → offre chiffrée → acceptation → complétion → avis » est modélisé de bout en bout, ce qui donne un cadre clair à la transaction.

Face à des canaux informels (groupes Facebook, bouche-à-oreille), l'apport principal est la structuration de la transaction et les signaux de confiance. La comparaison frontale avec des concurrents établis n'est pas pertinente sur le marché mongol au moment de la rédaction ; le projet vise un segment encore peu outillé.

## 1.4 Modèle économique

> **État dans le code : non implémenté.** Aucun mécanisme de paiement, de commission, d'abonnement ou de mise en avant payante n'existe dans le code à ce jour. Il n'y a ni intégration de prestataire de paiement, ni champ de facturation dans le schéma Prisma. Le contenu ci-dessous décrit des pistes envisagées, pas du code livré.

**MVP — gratuit.** La phase actuelle privilégie l'acquisition d'utilisateurs et la constitution de l'offre et de la demande. La plateforme est gratuite pour les deux côtés.

**V2 — pistes de monétisation envisagées (à spécifier dans une US dédiée) :**

- Commission sur les prestations complétées (le statut `COMPLETED` et le champ `price` de l'offre fournissent déjà l'assiette technique).
- Mise en avant payante d'annonces ou de profils prestataires.
- Abonnement « prestataire pro » (badge, statistiques, plafond d'offres relevé).
- Vérification d'identité premium.

Chacune de ces pistes nécessitera une intégration de paiement (idéalement un acteur local mongol) et une mise à jour du schéma. **À venir : voir US dédiée monétisation.**

## 1.5 Marché cible : spécificités Mongolie

Plusieurs décisions techniques découlent directement du marché mongol :

- **Cyrillique.** Le mongol s'écrit en alphabet cyrillique. L'application force `<html lang="mn">`, charge les polices `Noto Sans`, `Noto Serif` et `Noto Sans Mono` avec les sous-ensembles `latin` **et** `cyrillic`, et l'API force l'en-tête `Content-Type: application/json; charset=utf-8`. La recherche plein-texte PostgreSQL utilise la configuration `'simple'` (et non `'english'`) précisément parce que les *stemmers* linguistiques ne gèrent pas le mongol — `'simple'` se contente de normaliser et de découper en *tokens*, ce qui convient au cyrillique.
- **Mobile-first.** L'audience est très majoritairement mobile. Le layout inclut une `BottomNav` (navigation basse de type application native) et l'optimisation d'images (composant `next/image`, génération de *thumbnails* via `sharp`) vise à limiter la consommation de données.
- **Conditions réseau.** L'optimisation des images, le rendu côté serveur (Server Components par défaut) et la pagination systématique des listes réduisent le poids des pages et le nombre d'allers-retours, ce qui est important sur des réseaux mobiles parfois lents ou coûteux.
- **Couverture géographique.** Les villes et districts mongols sont fournis par le package partagé (`packages/shared/src/data/mn-locations`), ce qui permet des filtres de localisation cohérents (Улаанбаатар, Дархан, Эрдэнэт, etc.).

### Catégories de service (référentiel)

Les huit catégories de service sont définies comme constantes applicatives dans `packages/shared/src/categories.ts` (et non en base) :

| Slug | Libellé (mongol) |
|------|------------------|
| `network_repair` | Шугам сүлжээ засвар угсралт |
| `construction_renovation` | Барилга / Дотор засал |
| `moving` | Нүүлгэлт |
| `home_cleaning` | Гэр цэвэрлэгээ |
| `carpentry` | Мужаан, тавилга угсралт |
| `auto_repair` | Авто засвар |
| `babysitting` | Хүүхэд асрагч |
| `tutoring` | Гэрийн багш |

## 1.6 Périmètre MVP : livré / non livré

**Livré (présent dans le code de la branche `dev`) :**

- Authentification email + mot de passe, OAuth Google, et téléphone via Firebase (US-A1/A2).
- Vérification d'email et réinitialisation de mot de passe par lien (US-E2).
- Publication d'annonces avec images (upload, *thumbnails*, réordonnancement) et recherche plein-texte cyrillique (US-44).
- Filtres par catégorie, localisation et fourchette de prix ; pagination.
- Cycle d'offre complet : création, acceptation, refus, annulation, expiration (7 jours), complétion.
- Messagerie 1-to-1 rattachée à une annonce, avec compteur de non-lus et polling.
- Avis post-complétion (note + commentaire), profil public prestataire.
- Notifications in-app (10 types) et emails transactionnels (US-E1/E2/E3, 6 événements métier).
- Favoris (annonces et prestataires), zones de service prestataire, onboarding post-inscription.
- Vérification d'identité (KYC) avec revue par un administrateur.
- Back-office d'administration : statistiques, modération utilisateurs / annonces, revue KYC, traitement des signalements.
- Pages légales (CGU, confidentialité), SEO (pages catégories et villes, JSON-LD), tests E2E.

**Non livré / à venir :**

- Monétisation (paiements, commissions) — *non implémenté*.
- Page `/settings/security` unifiée et endpoint `auth-methods` — *développés mais non mergés sur `dev` (US-A4)*.
- Déploiement automatisé (CI/CD de production) — la CI ne couvre que lint/test/build sur `dev` (voir chapitre 9).
- OAuth e-Mongolia, mode sombre activé côté UI, digest hebdomadaire par email (clé de préférence `weeklyDigest` présente mais désactivée par défaut).

## 1.7 Roadmap accomplie (US-30 → US-A4)

La chronologie ci-dessous est reconstituée à partir du rapport d'avancement interne (`docs/reports/STATUS-2026-05-20.md`) et de l'historique Git récent. Le développement s'est structuré en sprints thématiques.

| Lot | US | Sujet | Statut |
|-----|----|-------|--------|
| Hardening | US-30 → US-35 | i18n encoding, typecheck strict, validation env, rate limiting, durcissement guards admin, nettoyage repo | Livré (dev) |
| Features | US-36 → US-41 | Notifications live (polling 30 s), onboarding, avis post-complétion, favoris, KYC, zones de service | Livré (dev) |
| Qualité/SEO/Legal | US-42 → US-46 | E2E Playwright, SEO catégories+villes, recherche plein-texte (tsvector), Core Web Vitals, pages légales | Livré (dev) |
| Refactoring | US-49 → US-52 | Quick wins sécurité/typage, split services backend + i18n notifs, split composants front + hooks, ErrorBoundary/tests | Livré (dev) |
| Design System v2 | US-53 → US-54 | Tokens + polices Noto + composants atomiques (palette « Atelier »), refonte home | Livré (dev) |
| Auth téléphone | US-A1 → US-A2 | Setup Firebase Admin + champs phone, endpoints phone (login/link/unlink) | Livré (dev) |
| Email | US-E1 → US-E3 | Setup Resend + EmailService, templates React Email + flows verify/reset, notifications transactionnelles | Livré (dev) |
| Sécurité (compte) | US-A4 | Page `/settings/security` unifiée + bannière + endpoint auth-methods | **À venir (non mergé sur dev)** |

*Remarque : la numérotation des US n'est pas strictement continue (certains numéros, p. ex. US-A3 « phone auth UI » ou US-47/48, correspondent à des lots intermédiaires ou à des UI livrées dans la chaîne de branches). Le tableau regroupe par lot cohérent plutôt que par numéro.*

## 1.8 Glossaire des termes métier

| Terme | Définition |
|-------|------------|
| **Annonce (listing)** | Demande de service publiée par un utilisateur. Porte une description, un prix indicatif, une catégorie et une localisation. |
| **Offre (offer)** | Proposition chiffrée d'un prestataire en réponse à une annonce. Suit une machine à états (voir §2.4 et §3.3). |
| **Demandeur (client)** | Utilisateur qui publie une annonce et reçoit des offres. Rôle `CLIENT` ou `BOTH`. |
| **Prestataire (provider)** | Utilisateur qui fait des offres. Rôle `PROVIDER` ou `BOTH`. |
| **Complétion** | Validation par le demandeur qu'une prestation acceptée a bien été réalisée (`status = COMPLETED`). Débloque les avis. |
| **Avis (review)** | Note (1–5) et commentaire déposés après complétion, dans les deux sens (chaque partie peut noter l'autre). |
| **KYC** | *Know Your Customer* — vérification d'identité par envoi d'un document, revue par un administrateur (`verificationStatus`). |
| **Zone de service** | Ville (et district optionnel) dans laquelle un prestataire déclare opérer (`ServiceZone`). |
| **Soft delete** | Suppression logique via `deletedAt` (User, Listing) plutôt que suppression physique. |
| **Onboarding** | Parcours guidé après l'inscription (choix du rôle, complétion du profil). |
| **CT / LXC** | Conteneur Linux (LXC) sur Proxmox. CT 101 = Caddy, CT 200 = application. Voir chapitre 8. |
