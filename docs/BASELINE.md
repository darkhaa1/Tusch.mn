# Baseline Report

## Package manager and scripts
- Package manager: pnpm (root `packageManager` is `pnpm@8.15.6`).
- Root scripts: `build`, `dev`, `lint`, `typecheck`, `test`, `format`, `smoke`.
- apps/api scripts: `build`, `format`, `start`, `dev`, `start:debug`, `start:prod`, `lint`, `typecheck`, `test`, `test:watch`, `test:cov`, `test:debug`, `test:e2e`, `test:e2e:watch`, `test:e2e:ci`.
- apps/web scripts: `dev`, `build`, `start`, `lint`, `typecheck`, `tailwind:init`.

## Commands to run (exact)
- Install: `pnpm install`
- Lint (all): `pnpm -w lint`
- Typecheck (all): `pnpm -w typecheck`
- Test (all): `pnpm -w test`
- Build (all): `pnpm -w build`

Optional, per app:
- API: `pnpm --filter api lint`, `pnpm --filter api typecheck`, `pnpm --filter api test`, `pnpm --filter api test:e2e`, `pnpm --filter api build`
- Web: `pnpm --filter web lint`, `pnpm --filter web typecheck`, `pnpm --filter web build`

## CI (dev branch)
- GitHub Actions runs on push to `dev`, PRs targeting `dev`, and manual dispatch.
- Local equivalent (with a running PostgreSQL 15):
  - `pnpm install`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm build`
  - `pnpm -C apps/api prisma generate`
  - `pnpm -C apps/api prisma migrate deploy`
  - `pnpm -C apps/api test:e2e -- --runInBand`
- Required env in CI: `DATABASE_URL`, `NODE_ENV=test`, `JWT_SECRET` (others optional via GitHub Secrets).

## Key pages to smoke test
- `/`
- `/listings`
- `/listings/[id]`
- `/profile`
- `/messages`
- `/admin`
- `/admin/listings`
- `/admin/users`
- `/u/[id]`

## Expected green state
- Install completes without errors.
- Lint, typecheck, and build complete successfully.
- Smoke test pages render without blank screens or runtime errors.
- API start command runs and key endpoints respond (if API is running).

## TODO (max 10)
1) Document the current source of truth for UI components and avoid duplication.
2) Consolidate listings UI in a single feature folder to reduce scatter.
3) Centralize query string parsing and URL sync logic for listings.
4) Create shared listings UI building blocks (grid, filters, pagination).
5) Verify listings API queries and cache keys stay consistent after changes.
6) Confirm admin listings filters work end-to-end.
7) Ensure profile listings (demandes) reuse listings card components.
8) Add or document a minimal smoke test flow for listings.
