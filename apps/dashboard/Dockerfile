FROM node:20-alpine AS base
RUN npm install -g pnpm

FROM base AS deps
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/dashboard/package.json ./apps/dashboard/package.json
COPY packages/shared/package.json ./packages/shared/package.json
COPY packages/shared/dist ./packages/shared/dist
RUN pnpm install --frozen-lockfile --filter dashboard

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV VITE_API_URL=http://localhost:3001
RUN pnpm --filter dashboard build

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/dashboard/dist /usr/share/nginx/html
COPY apps/dashboard/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
