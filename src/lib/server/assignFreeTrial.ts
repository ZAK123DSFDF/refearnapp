"use server"
import { subscription } from "@/db/schema"
import { getDB } from "@/db/drizzle"

export async function assignFreeTrialSubscription(userId: string) {
  if (!userId) return
  const db = await getDB()
  const existingSub = await db.query.subscription.findFirst({
    where: (s, { eq }) => eq(s.userId, userId),
  })

  if (existingSub) return

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7)

  await db.insert(subscription).values({
    userId,
    plan: "FREE",
    billingInterval: "MONTHLY",
    currency: "USD",
    price: "0.00",
    expiresAt,
  })
}
