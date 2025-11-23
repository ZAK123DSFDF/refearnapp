// lib/server/updatePlan.ts
import { paddleConfig } from "@/util/PaddleConfig"
import { Paddle, Environment } from "@paddle/paddle-node-sdk"
import { db } from "@/db/drizzle"
import { subscription } from "@/db/schema"
import { eq } from "drizzle-orm"

const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox,
})

/**
 * Main unified function.
 */
export async function updatePlan({
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
    await handleSubscriptionToSubscription({
      subscriptionId,
      targetPlan,
      targetCycle: targetCycle!,
      mode: mode!,
    })
    return null
  }

  if (modeType === "SUB_TO_ONE_TIME") {
    return await handleCancelSubscription({
      subscriptionId,
      targetPlan,
      mode,
    })
  }

  throw { status: 400, message: "Invalid modeType" }
}

/* -------------------------------------------------------------------------- */
/*   1) SUB → SUB (works & kept as-is, cleaned)                               */
/* -------------------------------------------------------------------------- */

async function handleSubscriptionToSubscription({
  subscriptionId,
  targetPlan,
  targetCycle,
  mode,
}: {
  subscriptionId: string
  targetPlan: "PRO" | "ULTIMATE"
  targetCycle: "MONTHLY" | "YEARLY"
  mode: "PRORATE" | "DO_NOT_BILL"
}) {
  const priceId = paddleConfig.priceIds.SUBSCRIPTION[targetCycle][targetPlan]

  if (!priceId) {
    throw {
      status: 400,
      toast: `Missing priceId for ${targetPlan} ${targetCycle}`,
    }
  }

  const prorationBillingMode =
    mode === "PRORATE" ? "prorated_immediately" : "do_not_bill"

  await paddle.subscriptions.update(subscriptionId, {
    prorationBillingMode,
    items: [
      {
        priceId,
        quantity: 1,
      },
    ],
  })
}

/* -------------------------------------------------------------------------- */
/*   2) SUB → ONE TIME (cancel subscription, then create new transaction)     */
/* -------------------------------------------------------------------------- */

export async function handleCancelSubscription({
  subscriptionId,
  targetPlan,
  mode,
}: {
  subscriptionId: string
  targetPlan: "PRO" | "ULTIMATE"
  mode: "PRORATE" | "DO_NOT_BILL"
}) {
  const priceId = paddleConfig.priceIds.PURCHASE[targetPlan]
  if (!priceId) {
    throw { status: 400, toast: `Missing one-time price for ${targetPlan}` }
  }

  // 1️⃣ Load subscription
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.id, subscriptionId),
  })
  if (!sub) {
    throw { status: 400, toast: "Subscription not found" }
  }
  const effectiveFrom =
    mode === "PRORATE" ? "immediately" : "next_billing_period"
  // 2️⃣ Cancel subscription immediately (Paddle requirement)
  await paddle.subscriptions.cancel(subscriptionId, {
    effectiveFrom,
  })
}
