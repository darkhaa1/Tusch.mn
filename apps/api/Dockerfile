FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile

# Génère le client Prisma APRÈS l'installation des dépendances
RUN pnpm --filter api exec prisma generate

RUN pnpm --filter api run build

FROM node:20-alpine AS prod
WORKDIR /app

COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/package.json ./
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/.env ./.env




ENV NODE_ENV=production
EXPOSE 3310
CMD ["node", "dist/main.js"]