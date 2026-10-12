// lib/server/organization/updatePolarPlan.ts
import "server-only"
import { createPolar } from "@polar-sh/sdk/2026-04"
import { polarConfig } from "@/lib/polarConfig"
import { AppError } from "@/lib/exceptions"

const polar = createPolar({
  accessToken: polarConfig.accessToken,
  environment: polarConfig.server,
})

export async function updatePolarPlan({
  subscriptionId,
  targetPlan,
  targetCycle,
  mode,
  modeType,
}: {
  subscriptionId: string
  targetPlan: "PRO" | "ULTIMATE"
  targetCycle?: "MONTHLY" | "YEARLY"
  mode: "PRORATE" | "DO_NOT_BILL"
  modeType: "SUB_TO_SUB" | "SUB_TO_ONE_TIME"
}) {
  if (modeType === "SUB_TO_SUB") {
    const productId = polarConfig.productIds.SUBSCRIPTION[targetCycle!]?.[targetPlan]
    if (!productId) {
      throw new AppError({ status: 400, toast: `Missing product for ${targetPlan} ${targetCycle}` })
    }
    await polar.subscriptions.update(subscriptionId, {
      product_id: productId,
      proration_behavior: mode === "PRORATE" ? "invoice" : "next_period",
    })
    return
  }

  if (modeType === "SUB_TO_ONE_TIME") {
    if (!polarConfig.productIds.PURCHASE[targetPlan]) {
      throw new AppError({ status: 400, toast: `Missing one-time product for ${targetPlan}` })
    }
    await polar.subscriptions.update(
      subscriptionId,
      mode === "PRORATE" ? { revoke: true } : { cancel_at_period_end: true }
    )
    return
  }

  throw new AppError({ status: 400, toast: "Invalid modeType" })
}
