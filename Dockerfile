# --- STAGE 1: Install dependencies ---
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace configs and manifests
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/paddle-config/package.json ./packages/paddle-config/

RUN pnpm install --frozen-lockfile

# --- STAGE 2: Build Dashboard ---
FROM node:20-alpine AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# 1. Bring in the pnpm environment (node_modules + manifests) from deps
COPY --from=deps /app /app

# 2. Copy source code EXPLICITLY
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

# 3. Build foundations (Ensure filter matches your package.json name)
RUN pnpm run build --filter "@repo/paddle-config"

# 4. Build the Dashboard
RUN pnpm run build --filter "@repo/dashboard"

# --- STAGE 3: Final Production Image ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy Next.js standalone output
# This contains EVERYTHING needed to run the app without node_modules
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

USER nextjs
EXPOSE 3000

# Next.js standalone entry point
CMD ["node", "apps/dashboard/server.js"]