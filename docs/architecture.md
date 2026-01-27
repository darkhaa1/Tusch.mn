# Architecture

## Monorepo layout
- `apps/web`: Next.js App Router (frontend).
- `apps/api`: NestJS API with Prisma + PostgreSQL.
- `packages/ui`: Shared UI components.
- `packages/shared`: Shared types, schemas, constants.
- `packages/lib`: Shared utilities used by packages.

## Web app flow
- NextAuth handles OAuth in `apps/web/src/app/api/auth`.
- Client-side `AuthSync` exchanges OAuth user data with the API for a backend session.
- React Query manages client data fetching and caching.

## API flow
- Nest modules live under `apps/api/src/modules`.
- `PrismaModule` provides DB access via `apps/api/src/database/prisma.service.ts`.
- REST endpoints are grouped by module (auth, user, listings, messages, admin).

## Data and migrations
- Prisma schema: `apps/api/prisma/schema.prisma`.
- Migrations: `apps/api/prisma/migrations`.
- Database: PostgreSQL (configured via env in `apps/api/.env` and `.env.test`).

## Shared contracts
- Cross-app types and schemas should live in `packages/shared/src`.
