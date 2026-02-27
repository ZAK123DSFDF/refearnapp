# --- STAGE 1: Base Image ---
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate

# --- STAGE 2: Install dependencies ---
FROM base AS deps
# Copy workspace manifests for dependency resolution
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/dashboard/package.json ./apps/dashboard/
COPY packages/paddle-config/package.json ./packages/paddle-config/

# Install dependencies into the root node_modules
RUN pnpm install --frozen-lockfile

# --- STAGE 3: Build Dashboard ---
FROM base AS builder
WORKDIR /app
# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
# Copy all source files
COPY . .

# 🚀 FIX: Re-run pnpm install offline to link binaries (like 'next') to apps/dashboard
# This creates the symlinks needed for the shell to find the 'next' command
RUN pnpm install --offline --frozen-lockfile

# --- IMPORTANT: Build-time Variables ---
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_SELF_HOSTED
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_CNAME_TARGET

ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_SELF_HOSTED=$NEXT_PUBLIC_SELF_HOSTED
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_CNAME_TARGET=$NEXT_PUBLIC_CNAME_TARGET

# Now 'next' will be found correctly
RUN pnpm run build --filter="@repo/dashboard"

# --- STAGE 4: Final Production Image ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Optimization: Port 3000 is default for Next.js standalone
ENV PORT=3000

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# Copy standalone build
# Note: Next.js standalone moves the server to apps/dashboard/server.js
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/public ./apps/dashboard/public

USER nextjs
EXPOSE 3000

# Next.js standalone entry point
CMD ["node", "apps/dashboard/server.js"]