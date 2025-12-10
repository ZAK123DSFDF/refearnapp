import prompts from "prompts"
import { subscription, purchase } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

const DEV_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"

async function devSetUserPlan({
  userId,
  plan,
  type,
}: {
  userId: string
  plan: "FREE" | "PRO" | "ULTIMATE" | "ONE_TIME_100" | "ONE_TIME_200"
  type: "FREE" | "SUBSCRIPTION" | "PURCHASE"
}) {
  try {
    const db = await getDB()
    // 🧹 Clear existing records
    await db.delete(subscription).where(eq(subscription.userId, userId))
    await db.delete(purchase).where(eq(purchase.userId, userId))

    // 🪙 SUBSCRIPTION PLAN
    if (type === "SUBSCRIPTION") {
      await db.insert(subscription).values({
        userId,
        plan: plan === "ULTIMATE" ? "ULTIMATE" : "PRO",
        billingInterval: "MONTHLY",
        currency: "USD",
        price: plan === "ULTIMATE" ? "2000" : "1000",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      })
    }

    // 💳 ONE-TIME PURCHASE
    else if (type === "PURCHASE") {
      await db.insert(purchase).values({
        userId,
        tier: plan as "PRO" | "ULTIMATE",
        price: plan === "PRO" ? "85" : "125",
        currency: "USD",
      })
    }

    // 🆓 FREE PLAN (insert minimal data for consistency)
    else {
      await db.insert(subscription).values({
        userId,
        plan: "FREE",
        billingInterval: "MONTHLY",
        currency: "USD",
        price: "0",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // still expire after 30 days for testing
      })
    }

    console.info(
      `✅ Successfully set ${type} plan "${plan}" for user ${userId}`
    )
  } catch (error) {
    console.error(`❌ Failed to set plan`, error)
  }
}

async function main() {
  const { action } = await prompts({
    type: "select",
    name: "action",
    message: "Select plan to apply:",
    choices: [
      { title: "Free Plan", value: { plan: "FREE", type: "FREE" } },
      {
        title: "Pro Subscription",
        value: { plan: "PRO", type: "SUBSCRIPTION" },
      },
      {
        title: "Ultimate Subscription",
        value: { plan: "ULTIMATE", type: "SUBSCRIPTION" },
      },
      {
        title: "Pro One-Time Purchase",
        value: { plan: "PRO", type: "PURCHASE" },
      },
      {
        title: "Ultimate One-Time Purchase",
        value: { plan: "ULTIMATE", type: "PURCHASE" },
      },
    ],
  })

  if (!action) {
    console.log("❌ No plan selected. Exiting.")
    process.exit(0)
  }

  await devSetUserPlan({ userId: DEV_USER_ID, ...action })
}

main()
  .then(() => console.log("Done"))
  .catch((err) => console.error(err))
