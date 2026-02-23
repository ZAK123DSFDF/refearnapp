import { db } from "@/db/drizzle"
import { subscription, purchase } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getOrgAuthForPlan } from "@/lib/server/organization/getOrgAuthForPlan"
import type { PlanInfo } from "@/lib/types/organization/planInfo"

function isSubscriptionValid(sub: typeof subscription.$inferSelect | null) {
  if (!sub) return false
  if (!sub.expiresAt) return false
  return sub.expiresAt.getTime() >= Date.now()
}

export async function getUserPlan(): Promise<PlanInfo> {
  if (process.env.NEXT_PUBLIC_SELF_HOSTED === "true") {
    return {
      plan: "ULTIMATE",
      type: "PURCHASE",
    }
  }
  const { userId } = await getOrgAuthForPlan()

  const [userSub, userPurchase] = await Promise.all([
    db.query.subscription.findFirst({ where: eq(subscription.userId, userId) }),
    db.query.purchase.findFirst({
      where: eq(purchase.userId, userId),
      orderBy: (purchase, { desc }) => [desc(purchase.tier)],
    }),
  ])

  // ✅ Check subscription first
  if (userSub) {
    if (isSubscriptionValid(userSub)) {
      if (userPurchase && !userPurchase.isActive) {
        return {
          plan: userSub.plan as PlanInfo["plan"],
          type: "SUBSCRIPTION",
          cycle: userSub.billingInterval as PlanInfo["cycle"],
          subscriptionId: userSub.id,
          hasPendingPurchase: true,
          pendingPurchaseTier: userPurchase.tier,
          subscriptionChangeAt: userSub.subscriptionChangeAt,
        }
      }
      return {
        plan: userSub.plan as PlanInfo["plan"],
        type: "SUBSCRIPTION",
        cycle: userSub.billingInterval as PlanInfo["cycle"],
        subscriptionId: userSub.id,
        subscriptionChangeAt: userSub.subscriptionChangeAt,
      }
    }
    return {
      plan: userSub.plan as PlanInfo["plan"], // keep the original plan (e.g. PRO or ULTIMATE)
      type: "EXPIRED",
      cycle: userSub.billingInterval as PlanInfo["cycle"],
      subscriptionId: userSub.id,
      subscriptionChangeAt: userSub.subscriptionChangeAt,
    }
  }

  // ✅ If user made one-time purchase
  if (userPurchase && userPurchase.isActive) {
    let mappedPlan: PlanInfo["plan"] = "PRO"
    if (userPurchase.tier === "ULTIMATE") mappedPlan = "ULTIMATE"
    if (userPurchase.tier === "PRO") mappedPlan = "PRO"

    return { plan: mappedPlan, type: "PURCHASE" }
  }
  // ✅ Default fallback (free plan)
  return { plan: "FREE", type: "FREE" }
}
