# 🏗️ Build stage
FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN corepack enable && corepack prepare pnpm@latest --activate
RUN pnpm install --frozen-lockfile
RUN pnpm build

# 🚀 Production stage
FROM node:20-alpine AS prod
WORKDIR /app

COPY --from=build /app/apps/web/.next ./.next
COPY --from=build /app/apps/web/public ./public
COPY --from=build /app/apps/web/package.json ./
COPY --from=build /app/node_modules ./node_modules

ENV NODE_ENV=production
EXPOSE 3000
CMD ["pnpm", "start"]
