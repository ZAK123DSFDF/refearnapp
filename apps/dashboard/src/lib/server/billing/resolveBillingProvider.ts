// lib/server/billing/resolveBillingProvider.ts
import "server-only"
import { BillingProvider, purchase, subscription } from "@/db/schema"
import { eq } from "drizzle-orm"
import { db } from "@/db/drizzle"


export function getActiveBillingProvider(): BillingProvider {
  // Fail-safe: unset or typo keeps today's behavior (Paddle)
  return process.env.ACTIVE_BILLING_PROVIDER === "polar" ? "polar" : "paddle"
}

export function pickBillingProvider(
  sub?: typeof subscription.$inferSelect | null,
  pur?: typeof purchase.$inferSelect | null
): BillingProvider {
  if (sub && sub.plan !== "FREE") return sub.provider ?? "paddle" // legacy rows
  if (pur) return pur.provider
  return getActiveBillingProvider()
}

export async function resolveBillingProvider(userId: string) {
  const [sub, pur] = await Promise.all([
    db.query.subscription.findFirst({ where: eq(subscription.userId, userId) }),
    db.query.purchase.findFirst({ where: eq(purchase.userId, userId) }),
  ])
  return pickBillingProvider(sub, pur)
}
