# Codex Agent Instructions (tusch.mn)

## Goals
- Ship small, testable increments.
- Prioritize security, performance, maintainability, UX, SEO.
- Keep changes minimal unless asked.

## Repo
- Monorepo (Next.js + NestJS + Prisma + PostgreSQL)
- Package manager: pnpm (if present) otherwise npm.

## Conventions
- TypeScript strict.
- Prefer server components when possible (Next.js).
- Validate inputs (DTO in Nest + Zod on client).
- No secrets in git. Use env vars.

## When editing code
- Update types and tests.
- Run lint + typecheck before finishing.
- Provide commands to run locally.

## Output format
- Summary of changes
- Files changed
- How to test
- Risks / follow-ups
