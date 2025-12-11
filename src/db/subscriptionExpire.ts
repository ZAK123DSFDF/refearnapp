// scripts/expire-subscription.ts
import "dotenv/config"
import { subscription } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

const DEV_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"

// ----------------------------- HELPERS -----------------------------

async function getLocalSubscription(userId: string) {
  const db = await getDB()
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })

  if (!sub) throw new Error("❌ No subscription found for " + userId)

  return sub
}

async function expireSubscription(sub: any) {
  const expiredAt = new Date()
  expiredAt.setDate(expiredAt.getDate() - 1)
  const db = await getDB()
  await db
    .update(subscription)
    .set({ expiresAt: expiredAt })
    .where(eq(subscription.id, sub.id))

  return expiredAt
}

// ----------------------------- MAIN -----------------------------

async function main() {
  const userId = process.argv[2] || DEV_USER_ID
  console.log(`▶ Using userId: ${userId}`)

  const sub = await getLocalSubscription(userId)

  console.log(`🔍 Found subscription: ${sub.id} (${sub.plan})`)

  const date = await expireSubscription(sub)

  console.log(`✔ Subscription expired at ${date.toISOString()}`)
  console.log("🎉 Done!")
}

main().catch((err) => console.error(err))
