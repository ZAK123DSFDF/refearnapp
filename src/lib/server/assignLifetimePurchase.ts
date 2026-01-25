import { db } from "@/db/drizzle"
import { purchase } from "@/db/schema"
// 1. Alias the types from the Paddle SDK
import {
  Paddle,
  Environment,
  type Transaction as PaddleTransaction,
} from "@paddle/paddle-node-sdk"
import { paddleConfig } from "@/util/PaddleConfig"

const paddle = new Paddle(paddleConfig.server.apiToken, {
  environment: paddleConfig.env,
})

export async function assignLifetimePurchase(userId: string, txnId: string) {
  if (!userId || !txnId) return

  try {
    // 2. Explicitly type the result to avoid Stripe interference
    const transaction: PaddleTransaction = await paddle.transactions.get(txnId)

    if (transaction.status !== "completed") {
      console.error("Transaction not completed")
      return
    }

    // 3. Paddle stores totals in transaction.details.totals
    // We safely parse the string total
    const totalPaid = parseFloat(transaction.details?.totals?.total || "0")

    let tier: "PRO" | "ULTIMATE" = "PRO"

    // Logic: 299 is Ultimate, 199 is Pro
    if (totalPaid >= 299) {
      tier = "ULTIMATE"
    } else if (totalPaid >= 199) {
      tier = "PRO"
    } else {
      console.error("Payment amount invalid:", totalPaid)
      return
    }

    // 4. Save to DB (Redis removed)
    await db.insert(purchase).values({
      id: txnId,
      userId,
      tier,
      price: totalPaid.toString(),
      currency: transaction.currencyCode || "USD",
      priceId: transaction.items[0]?.price?.id || "manual",
      isActive: true,
    })

    console.log(`Successfully assigned ${tier} to ${userId}`)
  } catch (error) {
    console.error("Paddle Transaction Error:", error)
  }
}
