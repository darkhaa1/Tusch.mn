# Public Profile Plan

## Audit (existing)
- **Prisma models**: `User` (id, email, password, firstName, lastName, phone, accountType, avatarUrl, createdAt/updatedAt), `Listing` (description, price, location, category, userId, images), `Message`; **no** Review/Rating model; no verification flags; listings linked to user via `userId`.
- **Backend routes**: `users` controller only `GET /users` (auth) and `GET /users/me` (auth); no public profile endpoint. Auth is JWT (Nest guard) plus NextAuth on web side.
- **Frontend**: Private `/profile` page (current user) under `apps/web/app/profile`; listing detail shows author block (avatar/name/email/phone) but no public profile link; no public profile page.

## What to add
- Prisma `Review` model (cuid id, targetUserId, reviewerId, rating 1..5, optional comment, createdAt) with indexes and unique per reviewer/target.
- Public profile API: `GET /users/:id/public` (no auth) returning safe DTO via whitelist select + aggregates (listingsCount, reviews stats, recent listings, reviews with reviewer safe info).
- Frontend public profile page at `/u/[id]` (Mongolian UI) showing avatar, name, trust badges, stats, recent listings, reviews; no private contact fields.
- React Query hook + API client for public profile; link author card on listing detail to `/u/{user.id}`.

## Public data (whitelist)
- User: `id`, `firstName`, `lastName`, `avatarUrl`, `createdAt`, derived flags (verified/placeholder), display name.
- Stats: listingsCount, completedCount (if available), responseRate (if available/null), ratingAvg, reviewsCount.
- Recent listings: `id`, `category`, `price`, `location`, `description` snippet, first image url, `createdAt`.
- Reviews (top N/paginated): `id`, `rating`, `comment`, `createdAt`, `reviewer` { `id`, `firstName`, `lastName`, `avatarUrl` }.

## Private data (blacklist)
- **Never expose**: `email`, `phone`, passwords, OAuth/provider ids, tokens, any contact info, internal flags not meant for public. Do not include full `User` objects; always use explicit `select`.
