import { db } from "@/db/drizzle"
import { organization, subscription, purchase, appsumoKeys } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getOrgAuthForPlan } from "@/lib/server/organization/getOrgAuthForPlan"
import type { PlanInfo } from "@/lib/types/organization/planInfo"
import { mapTierToPurchasePlan } from "@/util/appsumo"
import { pickBillingProvider } from "@/lib/server/billing/resolveBillingProvider"

// 1. Core Logic: The only place where the plan calculation lives
async function getPlanByUserId(userId: string): Promise<PlanInfo> {
  const [userSub, userPurchase, appsumoKey] = await Promise.all([
    db.query.subscription.findFirst({ where: eq(subscription.userId, userId) }),
    db.query.purchase.findFirst({
      where: eq(purchase.userId, userId),
      orderBy: (purchase, { desc }) => [desc(purchase.tier)],
    }),
    db.query.appsumoKeys.findFirst({
      where: eq(appsumoKeys.userId, userId),
    }),
  ])

  // Helper for validity

  const base = { userId, provider: pickBillingProvider(userSub, userPurchase) }
  if (userSub) {
    const isValid = (sub: typeof subscription.$inferSelect | null) =>
      sub?.expiresAt && sub.expiresAt.getTime() >= Date.now()
    if (isValid(userSub)) {
      return {
        ...base,
        plan: userSub.plan as PlanInfo["plan"],
        type: "SUBSCRIPTION",
        cycle: userSub.billingInterval as PlanInfo["cycle"],
        subscriptionId: userSub.id,
        subscriptionChangeAt: userSub.subscriptionChangeAt,
        hasPendingPurchase: userPurchase && !userPurchase.isActive,
        pendingPurchaseTier: userPurchase?.tier,
      }
    }
    return {
      ...base,
      plan: userSub.plan as PlanInfo["plan"],
      type: "EXPIRED",
      cycle: userSub.billingInterval as PlanInfo["cycle"],
      subscriptionId: userSub.id,
      subscriptionChangeAt: userSub.subscriptionChangeAt,
    }
  }

  if (userPurchase?.isActive) {
    return {
      ...base,
      plan: userPurchase.tier === "ULTIMATE" ? "ULTIMATE" : "PRO",
      type: "PURCHASE",
    }
  }

  if (appsumoKey && appsumoKey.status === "active") {
    return {
      ...base,
      plan: mapTierToPurchasePlan(appsumoKey.tier),
      type: "PURCHASE",
      isAppSumo: true,
      appsumoTier: appsumoKey.tier,
    }
  }

  return { ...base, plan: "FREE", type: "FREE" }
}

// 2. Wrapper A: Get plan for current user session
export async function getUserPlan(): Promise<PlanInfo> {
  if (process.env.NEXT_PUBLIC_SELF_HOSTED === "true")
    return { plan: "ULTIMATE", type: "PURCHASE" }
  const { userId } = await getOrgAuthForPlan()
  return getPlanByUserId(userId)
}

// 3. Wrapper B: Get plan for specific orgId
export async function getOrgPlan(orgId: string): Promise<PlanInfo> {
  if (process.env.NEXT_PUBLIC_SELF_HOSTED === "true")
    return { plan: "ULTIMATE", type: "PURCHASE" }

  const org = await db.query.organization.findFirst({
    where: eq(organization.id, orgId),
    columns: { userId: true },
  })

  if (!org) return { plan: "FREE", type: "FREE" }
  return getPlanByUserId(org.userId)
}
