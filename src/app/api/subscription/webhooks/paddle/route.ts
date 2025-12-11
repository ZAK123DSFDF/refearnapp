import { Environment, EventName, Paddle } from "@paddle/paddle-node-sdk"
import { NextResponse } from "next/server"
import { purchase, subscription } from "@/db/schema"
import { eq } from "drizzle-orm"
import { decodeOrgFromCustomData } from "@/util/DecodeOrgFromCustomData"
import { getDB } from "@/db/drizzle"
const paddle = new Paddle(process.env.PADDLE_SECRET_TOKEN!, {
  environment: Environment.sandbox,
})

export async function POST(req: Request) {
  const signature = req.headers.get("paddle-signature") || ""
  const rawBody = await req.text()
  const secretKey = process.env.WEBHOOK_SECRET_KEY || ""
  const db = await getDB()
  try {
    if (!signature || !rawBody) {
      console.log("❌ Missing signature or body")
      return NextResponse.json({ ok: false })
    }

    // ✅ Verify and parse webhook
    const event = await paddle.webhooks.unmarshal(rawBody, secretKey, signature)
    const { eventType, data } = event

    // 💳 Transaction completed — main event we care about
    if (eventType === EventName.TransactionCompleted) {
      console.log(`✅ Transaction completed: ${data.id}`)
      console.log(`🧾 Raw customData: ${JSON.stringify(data.customData)}`)

      const decodedOrg = decodeOrgFromCustomData(data.customData)
      if (!decodedOrg) {
        console.log("❌ Missing or invalid organizationToken")
        return NextResponse.json({ ok: true })
      }

      // 🎯 Extract shared info
      const item = data.items?.[0]
      const priceId = item?.price?.id
      const priceInfo = item?.price
      const priceDesc = priceInfo?.description || ""
      const priceAmount = Number(priceInfo?.unitPrice?.amount || 0)
      const currency = data.currencyCode || "USD"

      let planType: "PRO" | "ULTIMATE"

      // 🧠 Determine plan

      if (
        priceDesc.includes("ULTIMATE-SUBSCRIPTION") ||
        priceDesc.includes("ULTIMATE-SUBSCRIPTION-YEAR") ||
        priceDesc.includes("ULTIMATE-ONE-TIME-UPGRADE") ||
        priceDesc === "ULTIMATE" // 125 one-time
      ) {
        planType = "ULTIMATE"
      } else {
        planType = "PRO"
      }

      // 🧾 Detect if this is a subscription
      const isSubscription = !!data.subscriptionId

      if (!isSubscription) {
        //
        // ===========================
        //   ONE-TIME PURCHASE
        // ===========================
        //

        console.log("💰 One-time purchase detected")

        const isUpgrade = priceDesc.includes("ULTIMATE-ONE-TIME-UPGRADE")

        if (isUpgrade) {
          console.log("🔼 One-time upgrade: PRO → ULTIMATE")

          // remove previous PRO purchase
          await db.delete(purchase).where(eq(purchase.userId, decodedOrg.id))
        }
        const existingSub = await db.query.subscription.findFirst({
          where: eq(subscription.userId, decodedOrg.id),
        })

        if (existingSub) {
          if (existingSub.subscriptionChangeAt) {
            console.log(
              "⏳ Subscription pending downgrade — store one-time as inactive"
            )

            await db.insert(purchase).values({
              userId: decodedOrg.id,
              tier: planType,
              price: priceAmount.toString(),
              currency,
              priceId,
              isActive: false,
            })

            return NextResponse.json({ ok: true })
          }

          // ❌ No downgrade pending — user is switching to one-time immediately
          console.log("🗑 Removing active subscription — switching to one-time")

          await db
            .delete(subscription)
            .where(eq(subscription.userId, decodedOrg.id))
        }
        // 💾 Insert one-time
        await db.insert(purchase).values({
          userId: decodedOrg.id,
          tier: planType,
          price: priceAmount.toString(),
          priceId,
          currency,
        })

        console.log(`💾 Saved ONE-TIME ${planType} for user ${decodedOrg.id}`)
      } else {
        //
        // ===========================
        //   SUBSCRIPTION PURCHASE
        // ===========================
        //

        console.log("🔄 Subscription purchase detected")
        console.log(`this is decoded,📅 ${decodedOrg}`)
        const subscriptionId = data.subscriptionId
        const paddleInterval = priceInfo?.billingCycle?.interval ?? "month"
        const billingInterval = paddleInterval === "year" ? "YEARLY" : "MONTHLY"

        // Remove one-time purchases
        await db.delete(purchase).where(eq(purchase.userId, decodedOrg.id))

        // Update existing subscription (free → paid)
        await db
          .update(subscription)
          .set({
            id: subscriptionId,
            plan: planType,
            billingInterval,
            price: priceAmount.toString(),
            priceId,
            updatedAt: new Date(),
            expiresAt: data.billingPeriod?.endsAt
              ? new Date(data.billingPeriod.endsAt)
              : null,
          })
          .where(eq(subscription.userId, decodedOrg.id))

        // Only insert customer if not already there

        console.log(
          `💾 Saved SUBSCRIPTION ${planType} (${billingInterval}) for ${decodedOrg.id} `
        )
      }
    }
    // 🟢 Optional: other events for testing
    if (eventType === EventName.SubscriptionUpdated) {
      console.log(`🔄 Subscription updated: ${data.id}`)

      const decodedOrg = decodeOrgFromCustomData(data.customData)
      if (!decodedOrg) {
        console.log("❌ No user found for subscription.updated")
        return NextResponse.json({ ok: true })
      }

      const userId = decodedOrg.id

      const scheduled = data.scheduledChange
      const existing = await db.query.subscription.findFirst({
        where: eq(subscription.userId, userId),
      })

      if (!existing) {
        console.log("⚠️ Subscription not found — cannot update")
        return NextResponse.json({ ok: true })
      }
      const nextBillRaw = data.currentBillingPeriod?.endsAt ?? null
      const nextBill = nextBillRaw ? new Date(nextBillRaw) : null
      const priceId = data.items?.[0]?.price?.id ?? null
      // 🎯 CASE: User scheduled a cancellation
      if (scheduled?.action === "cancel") {
        const effectiveAt = scheduled.effectiveAt
          ? new Date(scheduled.effectiveAt)
          : null

        console.log(
          `📅 Scheduled cancel — ending at ${effectiveAt?.toISOString()}`
        )

        await db
          .update(subscription)
          .set({
            subscriptionChangeAt: effectiveAt,
            updatedAt: new Date(),
            expiresAt: nextBill,
          })
          .where(eq(subscription.userId, userId))

        return NextResponse.json({ ok: true })
      }
      // 🎯 CASE: Undo cancel OR subscription cycle
      if (
        !scheduled &&
        priceId === existing.priceId &&
        existing.expiresAt &&
        nextBill
      ) {
        const isSamePeriod = existing.expiresAt.getTime() === nextBill.getTime()

        console.log(
          isSamePeriod
            ? "🔁 User resumed subscription — cancellation undone"
            : "🔄 Subscription cycle completed — cancel cleared"
        )

        await db
          .update(subscription)
          .set({
            subscriptionChangeAt: null,
            updatedAt: new Date(),
            ...(isSamePeriod ? {} : { expiresAt: nextBill }),
          })
          .where(eq(subscription.userId, userId))

        return NextResponse.json({ ok: true })
      }
    }
    if (eventType === EventName.SubscriptionCanceled) {
      console.log(`❌ Subscription canceled: ${data.id}`)

      const decodedOrg = decodeOrgFromCustomData(data.customData)
      if (!decodedOrg) {
        console.log("❌ No user found for subscription.canceled")
        return NextResponse.json({ ok: true })
      }
      // Check if user has a pending one-time
      const pendingPurchase = await db.query.purchase.findFirst({
        where: eq(purchase.userId, decodedOrg.id),
      })

      if (pendingPurchase && pendingPurchase.isActive === false) {
        console.log("🎉 Activating pending one-time purchase")

        await db
          .update(purchase)
          .set({ isActive: true })
          .where(eq(purchase.userId, decodedOrg.id))
        await db
          .delete(subscription)
          .where(eq(subscription.userId, decodedOrg.id))
      } else {
        console.log("ℹ️ No pending one-time purchase — user becomes FREE")
      }

      await db
        .update(subscription)
        .set({
          plan: "FREE",
          billingInterval: "MONTHLY",
          price: null,
          priceId: null,
          expiresAt: new Date(), // or keep null if you prefer
          subscriptionChangeAt: null,
          updatedAt: new Date(),
        })
        .where(eq(subscription.userId, decodedOrg.id))

      console.log(
        `🧹 Subscription canceled → reset to FREE for ${decodedOrg.id}`
      )
    }
  } catch (error) {
    console.error("❌ Webhook Error:", error)
  }

  // ✅ Always return 200 so Paddle doesn’t retry
  return NextResponse.json({ ok: true })
}
