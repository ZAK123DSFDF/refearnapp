# --- STAGE 1: Install dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configs and manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/paddle-config/package.json ./packages/paddle-config/

# Install all dependencies (hoisted to root)
RUN pnpm install --frozen-lockfile

# --- STAGE 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Bring in the pnpm environment (node_modules + manifests)
COPY --from=deps /app /app

# 2. Copy source code for the app and its internal library
COPY apps/dashboard ./apps/dashboard
COPY packages/paddle-config ./packages/paddle-config
COPY turbo.json ./turbo.json

# Build-time variables for Next.js
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_SELF_HOSTED
ARG NEXT_PUBLIC_CNAME_TARGET

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_SELF_HOSTED=$NEXT_PUBLIC_SELF_HOSTED
ENV NEXT_PUBLIC_CNAME_TARGET=$NEXT_PUBLIC_CNAME_TARGET

# 3. Build ONLY the dashboard using the CORRECT package name
# We use the full name from your package.json
RUN pnpm turbo run build --filter="@repo/dashboard"

# --- STAGE 3: Final Run ---
FROM node:20-alpine AS dashboard
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy Next.js standalone output

COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

USER nextjs
EXPOSE 3000

# server.js is the entry point for standalone mode
CMD ["node", "apps/dashboard/server.js"]