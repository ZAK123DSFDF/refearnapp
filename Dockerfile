# --- STAGE 1: Install dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configs and manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY apps/landing-page/package.json ./apps/landing-page/
COPY apps/tracking-worker/package.json ./apps/tracking-worker/
COPY packages/paddle-config/package.json ./packages/paddle-config/

RUN pnpm install --frozen-lockfile

# --- STAGE 2: Build all apps ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Bring in the pnpm environment (node_modules + binaries)
COPY --from=deps /app /app

# 2. FIXED: Copy source code EXPLICITLY to avoid node_modules collision
COPY apps ./apps
COPY packages ./packages
COPY turbo.json ./turbo.json

# Build-time variables
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_SELF_HOSTED
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_SELF_HOSTED=$NEXT_PUBLIC_SELF_HOSTED
RUN echo "Is self hosted: $NEXT_PUBLIC_SELF_HOSTED"
# 3. Build foundations (Ensure filter matches your package.json name)
RUN pnpm run build --filter "@repo/paddle"

# 4. Build apps with the CORRECT scoped names
RUN pnpm run build --filter "@repo/dashboard"
RUN pnpm run build --filter "@repo/landing-page"
# --- TARGET 1: Dashboard (Next.js) ---
FROM node:20-alpine AS dashboard
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Next.js standalone mode output
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

USER nextjs
EXPOSE 3000
CMD ["node", "apps/dashboard/server.js"]

# --- TARGET 2: Landing Page (Astro) ---
FROM node:20-alpine AS landing
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/landing-page/dist ./dist
COPY --from=builder /app/apps/landing-page/package.json ./
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
