#!/usr/bin/env bash
set -euo pipefail

WORKER_URL="https://affiliate-d1-admin.zekariyasberihun8.workers.dev"
SEED_SECRET="super-secret-string-123"
HEADER="x-seed-secret: ${SEED_SECRET}"

echo "🚨 Starting ADMIN D1 pipeline"
echo "--------------------------------"

echo "🚀 Deploying admin worker..."
wrangler deploy --config wrangler.admin.toml

echo "♻️ Resetting database..."
curl -k -sS -H "${HEADER}" "${WORKER_URL}/reset"
echo ""

echo "🧬 Generating drizzle migrations..."
pnpm drizzle-kit generate

echo "📦 Running migrations..."
pnpm drizzle-kit migrate

echo "💱 Seeding currency rates..."
curl -k -sS -H "${HEADER}" "${WORKER_URL}/currency"
echo ""

echo "🌱 Seeding base data..."
curl -k -sS -H "${HEADER}" "${WORKER_URL}/seed"
echo ""

echo "--------------------------------"
echo "✅ ADMIN D1 pipeline completed"
