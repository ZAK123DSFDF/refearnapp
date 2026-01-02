import "dotenv/config"
import { db } from "@/db/drizzle"
import { subscription } from "@/db/schema"
import { eq } from "drizzle-orm"

const PADDLE_API = "https://sandbox-api.paddle.com"
const API_KEY = process.env.PADDLE_SECRET_TOKEN!
const NOTIFICATION_SETTING_ID = process.env.PADDLE_NOTIFICATION_SETTING_ID!
const DEV_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"
async function getUserSubscription(userId: string) {
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })

  if (!sub)
    throw new Error("❌ No subscription found in local DB for user: " + userId)
  return sub
}
async function getPaddleSubscription(subscriptionId: string) {
  const res = await fetch(`${PADDLE_API}/subscriptions/${subscriptionId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  const json = (await res.json()) as any
  if (!json.data) {
    console.error("Paddle API Error:", json)
    throw new Error("Could not fetch live subscription from Paddle")
  }
  return json.data
}

function addCycles(date: Date, type: "MONTHLY" | "YEARLY", cycles: number) {
  const newDate = new Date(date)
  if (type === "YEARLY") {
    newDate.setFullYear(newDate.getFullYear() + cycles)
  } else {
    newDate.setMonth(newDate.getMonth() + cycles)
  }
  return newDate
}
async function createSimulation(fullSubscriptionPayload: any, cycles: number) {
  const payload = {
    notification_setting_id: NOTIFICATION_SETTING_ID,
    name: `Simulate ${cycles} cycle(s) - ${Date.now()}`,
    type: "subscription.updated",
    payload: fullSubscriptionPayload,
  }

  const res = await fetch(`${PADDLE_API}/simulations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  })

  const json = (await res.json()) as any
  if (!json.data) {
    console.log("Create simulation error:", json)
    throw new Error("Failed to create simulation")
  }

  return json.data.id
}

async function runSimulation(simulationId: string) {
  const res = await fetch(`${PADDLE_API}/simulations/${simulationId}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
  })

  const json = (await res.json()) as any
  return json.data
}

async function main() {
  const cycles = Number(process.argv[2]) || 1
  const userId = process.argv[3] || DEV_USER_ID

  console.log(`\n▶ Using userId: ${userId}`)
  console.log(`▶ Simulating ${cycles} billing cycle(s)\n`)
  const localSub = await getUserSubscription(userId)
  console.log(`Fetching live data for subscription: ${localSub.id}...`)
  const livePaddleSub = await getPaddleSubscription(localSub.id)
  const currentNextBill = new Date(livePaddleSub.next_billed_at)
  const billingInterval = livePaddleSub.billing_cycle.interval

  console.log(`Current Paddle Interval: ${billingInterval}`)

  const newNextBill = addCycles(
    currentNextBill,
    billingInterval === "year" ? "YEARLY" : "MONTHLY",
    cycles
  )

  const periodStart = currentNextBill.toISOString()
  const periodEnd = newNextBill.toISOString()

  console.log("New next_billed_at:", periodEnd)
  console.log("New start:", periodStart)
  console.log("New end:", periodEnd)
  const simulationPayload = {
    ...livePaddleSub,
    next_billed_at: periodEnd,
    current_billing_period: {
      starts_at: periodStart,
      ends_at: periodEnd,
    },
  }

  // E. Create and Run
  const simulationId = await createSimulation(simulationPayload, cycles)
  console.log("Simulation created:", simulationId)

  const result = await runSimulation(simulationId)
  console.log("\n🎉 Simulation run complete!")
  console.log(`Status: ${result.status}`)
}

main().catch((err) => {
  console.error("\n❌ Error:", err.message)
})
