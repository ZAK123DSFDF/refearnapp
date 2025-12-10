import "dotenv/config"
import prompts from "prompts"
import { subscription, subscriptionExpiration } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

const DEV_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"

// ----------------------------- HELPERS -----------------------------

async function clearUserPlans(userId: string) {
  const db = await getDB()
  await db.delete(subscription).where(eq(subscription.userId, userId))
}

async function forceExpire(subscriptionId: string) {
  const expiredAt = new Date()
  expiredAt.setDate(expiredAt.getDate() - 1)
  const db = await getDB()
  // main subscription table
  await db
    .update(subscription)
    .set({ expiresAt: expiredAt })
    .where(eq(subscription.id, subscriptionId))

  // expiration table
  const exp = await db.query.subscriptionExpiration.findFirst({
    where: eq(subscriptionExpiration.subscriptionId, subscriptionId),
  })

  if (exp) {
    await db
      .update(subscriptionExpiration)
      .set({ expirationDate: expiredAt })
      .where(eq(subscriptionExpiration.subscriptionId, subscriptionId))
  } else {
    await db.insert(subscriptionExpiration).values({
      subscriptionId,
      expirationDate: expiredAt,
    })
  }

  console.log("✔ Forced expire:", expiredAt.toISOString())
}

// ----------------------------- SET PLAN -----------------------------

async function setSubscriptionPlan(
  userId: string,
  plan: "FREE" | "PRO" | "ULTIMATE"
) {
  const price = plan === "FREE" ? "0" : plan === "ULTIMATE" ? "2000" : "1000"
  const db = await getDB()
  const result = await db
    .insert(subscription)
    .values({
      userId,
      plan,
      billingInterval: "MONTHLY",
      currency: "USD",
      price,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
    })
    .returning()

  return result[0]
}

// ----------------------------- MAIN -----------------------------

async function main() {
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "Select plan to apply:",
    choices: [
      // EXPIRED OPTIONS
      { title: "⚠️ Free Plan (Expired)", value: "FREE_EXPIRED" },
      { title: "⚠️ Pro Subscription (Expired)", value: "PRO_EXPIRED" },
      {
        title: "⚠️ Ultimate Subscription (Expired)",
        value: "ULTIMATE_EXPIRED",
      },
    ],
  })

  if (!action) return console.log("❌ Cancelled")

  // clear existing data
  await clearUserPlans(DEV_USER_ID)

  // ----------------- FREE -----------------
  if (action === "FREE") {
    await setSubscriptionPlan(DEV_USER_ID, "FREE")
    console.log("✔ FREE Plan set")
    return
  }

  // ----------------- SUBSCRIPTIONS -----------------
  if (action === "PRO_SUB") {
    await setSubscriptionPlan(DEV_USER_ID, "PRO")
    console.log("✔ PRO Subscription set")
    return
  }

  if (action === "ULTIMATE_SUB") {
    await setSubscriptionPlan(DEV_USER_ID, "ULTIMATE")
    console.log("✔ ULTIMATE Subscription set")
    return
  }

  // ----------------- EXPIRED STATES -----------------

  if (action === "FREE_EXPIRED") {
    const sub = await setSubscriptionPlan(DEV_USER_ID, "FREE")
    await forceExpire(sub.id)
    console.log("✔ FREE Expired Plan created")
    return
  }

  if (action === "PRO_EXPIRED") {
    const sub = await setSubscriptionPlan(DEV_USER_ID, "PRO")
    await forceExpire(sub.id)
    console.log("✔ PRO Expired Subscription created")
    return
  }

  if (action === "ULTIMATE_EXPIRED") {
    const sub = await setSubscriptionPlan(DEV_USER_ID, "ULTIMATE")
    await forceExpire(sub.id)
    console.log("✔ ULTIMATE Expired Subscription created")
    return
  }
}

main().catch(console.error)
