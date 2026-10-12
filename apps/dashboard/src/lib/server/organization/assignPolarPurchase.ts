import "server-only"
import { db } from "@/db/drizzle"
import { purchase } from "@/db/schema"
import { polar } from "@/lib/server/polarClient"
import { resolvePolarProduct } from "@/lib/polarConfig"

export async function assignPolarPurchase(userId: string, checkoutId: string) {
  if (!userId || !checkoutId) return

  try {
    const checkout = await polar.checkouts.get(checkoutId)
    if (checkout.status !== "succeeded") return

    // Only one-time products can be claimed at signup
    const product = resolvePolarProduct(checkout.product_id)
    if (product?.kind !== "PURCHASE") {
      console.error("Polar checkout is not a one-time product", checkoutId)
      return
    }

    // Reject refunded orders (the refund webhook may have arrived before this claim)
    const { items } = await polar.orders.list({ checkout_id: checkoutId, limit: 1 })
    const order = items[0]
    if (!order || !order.paid || order.status === "refunded") {
      console.error("Polar order missing or refunded for checkout", checkoutId)
      return
    }

    // Same rule as Paddle: a PRO purchase under an active ULTIMATE subscription stays pending
    const currentSub = await db.query.subscription.findFirst({
      where: (s, { eq }) => eq(s.userId, userId),
    })
    let isActive = true
    if (currentSub && currentSub.plan === "ULTIMATE" && product.plan === "PRO") {
      const isSubActive = currentSub.expiresAt
        ? currentSub.expiresAt.getTime() > Date.now()
        : true
      if (isSubActive) isActive = false
    }

    await db.insert(purchase).values({
      id: order.id, // single-use: a second claim hits the primary key
      userId,
      tier: product.plan,
      price: String(checkout.total_amount), // cents, same as the Paddle path
      currency: checkout.currency.toUpperCase(),
      priceId: checkout.product_id ?? "manual",
      provider: "polar",
      isActive,
    })

    console.log(`💾 Assigned ${product.plan} (Active: ${isActive}) to user ${userId}`)
  } catch (error) {
    console.error("Polar checkout claim error:", error)
  }
}
