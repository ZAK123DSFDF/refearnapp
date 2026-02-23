# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy the root package files
COPY package.json package-lock.json* ./

# Copy ALL package.json files from the workspace to ensure internal links work
COPY apps/dashboard/package.json ./apps/dashboard/
# Add your other two apps here so npm sees the full workspace tree
COPY apps/landing-page/package.json ./apps/landing-page/
COPY apps/tracking-worker/package.json ./apps/tracking-worker/
# If you have a /packages folder, copy those too!
# COPY packages/database/package.json ./packages/database/
COPY packages/paddle-config/package.json ./packages/paddle-config/

RUN npm ci

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time variables for Dashboard
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_PAYPAL_CLIENT_ID
ARG NEXT_PUBLIC_SELF_HOSTED
ENV NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL
ENV NEXT_PUBLIC_PAYPAL_CLIENT_ID=$NEXT_PUBLIC_PAYPAL_CLIENT_ID
ENV NEXT_PUBLIC_SELF_HOSTED=$NEXT_PUBLIC_SELF_HOSTED
RUN npm run build --workspace=dashboard

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Standalone mode only includes what's needed for the dashboard
COPY --from=builder /app/apps/dashboard/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/dashboard/.next/static ./apps/dashboard/.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/dashboard/server.js"]