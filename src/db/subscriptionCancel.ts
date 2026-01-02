// scripts/simulate-cancel.ts
import "dotenv/config"
import { db } from "@/db/drizzle"
import { subscription } from "@/db/schema"
import { eq } from "drizzle-orm"

const PADDLE_API = "https://sandbox-api.paddle.com"
const API_KEY = process.env.PADDLE_SECRET_TOKEN!
const NOTIFICATION_SETTING_ID = process.env.PADDLE_NOTIFICATION_SETTING_ID!
const DEV_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"

async function getLocalSubscription(userId: string) {
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })
  if (!sub) throw new Error("❌ No local subscription found for " + userId)
  return sub
}

async function getPaddleSubscription(subscriptionId: string) {
  const res = await fetch(`${PADDLE_API}/subscriptions/${subscriptionId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  })
  const json = (await res.json()) as any
  if (!json.data) {
    console.log(json)
    throw new Error("❌ Could not fetch subscription from Paddle")
  }
  return json.data
}

async function createImmediateCancelSimulation(payload: any) {
  const body = {
    notification_setting_id: NOTIFICATION_SETTING_ID,
    name: `Immediate cancel - ${Date.now()}`,
    type: "subscription.canceled",
    payload,
  }

  const res = await fetch(`${PADDLE_API}/simulations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(body),
  })

  const json = (await res.json()) as any
  if (!json.data) {
    console.log("Simulation create error:", json)
    throw new Error("❌ Failed to create cancel simulation")
  }

  return json.data.id
}

async function runSimulation(id: string) {
  const res = await fetch(`${PADDLE_API}/simulations/${id}/runs`, {
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
  const userId = process.argv[2] || DEV_USER_ID

  console.log(`▶ Using userId: ${userId}`)

  const localSub = await getLocalSubscription(userId)
  const liveSub = await getPaddleSubscription(localSub.id)

  console.log(`🔍 Live Paddle subscription: ${localSub.id}`)

  // 🧩 Build the cancel payload (similar to real Paddle)
  const cancelPayload = {
    ...liveSub,
    status: "canceled",
    canceled_at: new Date().toISOString(),
    next_billed_at: null,
    scheduled_change: null,
    current_billing_period: {
      starts_at: liveSub.current_billing_period.starts_at,
      ends_at: liveSub.current_billing_period.ends_at,
    },
  }

  // 🎯 Create + run the simulation
  const simulationId = await createImmediateCancelSimulation(cancelPayload)
  console.log("📝 Simulation created:", simulationId)

  const result = await runSimulation(simulationId)
  console.log("🎉 Simulation executed:", result.status)
}

main().catch((err) => console.error(err))
