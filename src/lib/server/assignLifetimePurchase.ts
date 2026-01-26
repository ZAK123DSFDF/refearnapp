import { db } from "@/db/drizzle"
import { purchase } from "@/db/schema"
// 1. Alias the types from the Paddle SDK
import {
  Paddle,
  type Transaction as PaddleTransaction,
} from "@paddle/paddle-node-sdk"
import { paddleConfig } from "@/util/PaddleConfig"

const paddle = new Paddle(paddleConfig.server.apiToken, {
  environment: paddleConfig.env,
})

export async function assignLifetimePurchase(userId: string, txnId: string) {
  if (!userId || !txnId) return

  try {
    const transaction: PaddleTransaction = await paddle.transactions.get(txnId)
    if (transaction.status !== "completed") return

    const totalPaid = parseFloat(transaction.details?.totals?.total || "0")
    let tier: "PRO" | "ULTIMATE" = totalPaid >= 29900 ? "ULTIMATE" : "PRO"

    // 🔍 Check current subscription status
    const currentSub = await db.query.subscription.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    })

    // 🧠 Logic: If user has a higher-tier active subscription,
    // we store this purchase as INACTIVE for now.
    let isActive = true
    if (currentSub && currentSub.plan === "ULTIMATE" && tier === "PRO") {
      const isSubActive = currentSub.expiresAt
        ? currentSub.expiresAt.getTime() > Date.now()
        : true
      if (isSubActive) {
        isActive = false // Store as pending
      }
    }

    await db.insert(purchase).values({
      id: txnId,
      userId,
      tier,
      price: totalPaid.toString(),
      currency: transaction.currencyCode || "USD",
      priceId: transaction.items[0]?.price?.id || "manual",
      isActive: isActive,
    })

    console.log(`💾 Assigned ${tier} (Active: ${isActive}) to user ${userId}`)
  } catch (error) {
    console.error("Paddle Transaction Error:", error)
  }
}
