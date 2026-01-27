# Conventions

## Structure
- `apps/web/src/app`: Next.js App Router routes and layouts.
- `apps/web/src/features`: Feature-level UI and logic grouped by domain.
- `apps/web/src/components`: Shared layout, header, and navigation components.
- `apps/web/src/components/ui`: Reusable UI primitives and small helpers.
- `apps/web/src/lib`: Client helpers (API clients in `lib/api`, hooks in `lib/hooks`, utilities in `lib/*`).
- `apps/web/src/styles`: Global styles.
- `apps/web/src/types`: Type augmentations and global types.

- `apps/api/src/modules`: Nest feature modules (auth, user, listings, messages, admin).
- `apps/api/src/common`: Shared guards, decorators, and helpers.
- `apps/api/src/database`: Prisma module and service.
- `apps/api/src/config`: Configuration providers.
- `apps/api/prisma`: Prisma schema and migrations.

- `packages/shared/src`: Shared types, schemas, and constants.
- `packages/ui`: Design-system components.

## Imports and aliases
- Prefer aliases for web/shared code: `@web/*`, `@shared/*`.
- Keep API imports relative unless alias support is added for runtime builds.
- Avoid deep relative imports in web; use aliases instead.
- Add `index.ts` only when it removes friction and does not hide structure.

## Naming
- React components: `PascalCase`.
- Hooks: `useSomething`.
- Feature folders: `kebab-case` or `camelCase`, keep consistent within a feature.
- Keep file names aligned with exported symbols.

## Where to place new code
- New route page or layout: `apps/web/src/app/...`.
- Feature UI + client logic: `apps/web/src/features/<feature>`.
- Shared UI pieces: `apps/web/src/components/ui`.
- Fetch/api helpers: `apps/web/src/lib/api`.
- Nest module: `apps/api/src/modules/<module>`.
- Prisma data access: `apps/api/src/database`.
