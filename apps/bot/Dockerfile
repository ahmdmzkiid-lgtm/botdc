FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/bot/package.json ./apps/bot/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/dist ./packages/shared/dist
RUN pnpm install --frozen-lockfile --filter bot

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm --filter bot build

FROM base AS runner
WORKDIR /app
COPY --from=builder /app/apps/bot/dist ./dist
COPY --from=builder /app/apps/bot/node_modules ./node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY apps/bot/package.json ./

EXPOSE 3001

CMD ["sh", "-c", "node dist/api/server.js & node dist/bot.js"]
