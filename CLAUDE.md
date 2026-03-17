# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Install
pnpm install

# Development
pnpm dev                        # Run all apps (web + api)
pnpm -w lint                    # Lint everything
pnpm -w typecheck               # Type-check everything
pnpm -w build                   # Build everything
pnpm format                     # Prettier on all .ts/.tsx/.md files

# API only
pnpm --filter api test          # Unit tests
pnpm --filter api test:e2e      # E2E tests
pnpm --filter api lint
pnpm --filter api typecheck

# Web only
pnpm --filter web lint
pnpm --filter web typecheck
pnpm --filter web build

# Database
pnpm -C apps/api prisma generate
pnpm -C apps/api prisma migrate deploy
pnpm -C apps/api prisma migrate dev   # create new migration during development

# Smoke test (full build + e2e + unit)
pnpm smoke
```

Always run `pnpm -w lint` and `pnpm -w typecheck` before finishing a task.

## Architecture

pnpm + Turbo monorepo. Three active workspaces:

- **`apps/web`** – Next.js 16 frontend (App Router, React 19, TailwindCSS 4)
- **`apps/api`** – NestJS 11 backend (Prisma ORM, PostgreSQL 15, JWT auth)
- **`packages/shared`** – Shared TypeScript types, Zod schemas, enums, constants consumed by both apps

### Authentication flow

NextAuth handles OAuth (Google, Facebook) in `apps/web/src/app/api/auth`. After OAuth sign-in, the client-side `AuthSync` component exchanges the OAuth user data with the NestJS API to establish a backend JWT session stored as an HTTP-only cookie.

### Web app structure

```
apps/web/src/
├── app/              # Routes and layouts (App Router)
├── features/         # Feature-level UI and logic grouped by domain
├── components/       # Shared layout/nav components; components/ui for primitives
├── lib/
│   ├── api/          # API client helpers (React Query wrappers)
│   └── hooks/        # Shared hooks
└── types/            # Global type augmentations
```

New code placement:
- Route page/layout → `apps/web/src/app/...`
- Feature UI + client logic → `apps/web/src/features/<feature>`
- Shared UI primitives → `apps/web/src/components/ui`
- Fetch/API helpers → `apps/web/src/lib/api`

Use path aliases `@web/*` and `@shared/*` for web imports; avoid deep relative paths.

### API structure

```
apps/api/src/
├── modules/          # Feature modules: auth, user, listings, offers, messages,
│                     #   reviews, notifications, favorites, reports, admin, health, metrics
├── common/           # Guards, decorators, shared helpers
├── database/         # PrismaModule + PrismaService
└── config/           # Configuration providers
```

New Nest modules go in `apps/api/src/modules/<module>`. DB access goes through `PrismaService`.

Prisma schema: `apps/api/prisma/schema.prisma`; migrations: `apps/api/prisma/migrations/`.

### Shared packages

Cross-app types, Zod schemas, and constants live in `packages/shared/src`. Both `apps/web` and `apps/api` import from `@repo/shared`.

### Environment variables

Required for API: `DATABASE_URL`, `JWT_SECRET` (≥16 chars), `CORS_ORIGIN`.
Optional: `JWT_EXPIRES_IN` (default `7d`), `METRICS_API_KEY`, OAuth credentials.
Test environment: `apps/api/.env.test` with `NODE_ENV=test`.

## Conventions

- TypeScript strict mode throughout.
- Prefer server components in Next.js; use client components only when needed.
- Validate inputs with NestJS DTOs (class-validator) on the API and Zod on the client.
- React components: `PascalCase`. Hooks: `useSomething`. Feature folders: `kebab-case`.
- Keep API imports relative (no alias for runtime builds); use `@web/*` and `@shared/*` in web.
