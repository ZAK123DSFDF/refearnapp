import { EventName, Paddle } from "@paddle/paddle-node-sdk"
import { NextResponse } from "next/server"
import { organization, purchase, subscription } from "@/db/schema"
import { db } from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { decodeOrgFromCustomData } from "@/util/DecodeOrgFromCustomData"
import { syncOrgDataToRedisLinks } from "@/lib/server/organization/syncOrgDataToRedisLinks"
import { paddleConfig } from "@repo/paddle"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

const paddle = new Paddle(paddleConfig.server.apiToken, {
  environment: paddleConfig.env,
})

async function resolveOrgContext(subscriptionId: string | null | undefined, customData: any) {
  // 1. Token still valid: use it (needed for a first purchase, before the DB has the sub id)
  const decoded = decodeOrgFromCustomData(customData)
  if (decoded) return decoded

  // 2. Token expired or missing: find the user through the Paddle subscription id
  if (!subscriptionId) return null
  const sub = await db.query.subscription.findFirst({
    where: eq(subscription.id, subscriptionId),
  })
  if (!sub) return null
  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, sub.userId),
  })
  if (!org) return null
  return { id: sub.userId, activeOrgId: org.id }
}

export const POST = handleRoute("Paddle Webhook", async (req) => {
  const signature = req.headers.get("paddle-signature") || ""
  const rawBody = await req.text()

  // 1. Initial Validation
  if (!signature || !rawBody) {
    console.log("❌ Missing signature or body")
    throw new AppError({
      error: "BAD_REQUEST",
      toast: "Missing signature or body",
      status: 400,
    })
  }

  // 2. Verify and parse webhook
  // If unmarshal fails, handleRoute will catch the error and log it.
  const event = await paddle.webhooks.unmarshal(
    rawBody,
    paddleConfig.server.webhookSecret,
    signature
  )
  const { eventType, data } = event

  // 💳 Transaction completed — main event
  if (eventType === EventName.TransactionCompleted) {
    console.log(`✅ Transaction completed: ${data.id}`)

    const decodedOrg = await resolveOrgContext(data.subscriptionId, data.customData)
    if (!decodedOrg) {
      return NextResponse.json({ ok: true, skipped: "cannot resolve user for transaction" })
    }

    const item = data.items?.[0]
    const priceId = item?.price?.id
    const priceInfo = item?.price
    const priceDesc = priceInfo?.description || ""
    const priceAmount = Number(priceInfo?.unitPrice?.amount || 0)
    const currency = data.currencyCode || "USD"

    const planType: "PRO" | "ULTIMATE" =
      priceDesc.includes("ULTIMATE-SUBSCRIPTION") ||
      priceDesc.includes("ULTIMATE-SUBSCRIPTION-YEAR") ||
      priceDesc.includes("ULTIMATE-ONE-TIME-UPGRADE") ||
      priceDesc.includes("ULTIMATE-ONE-TIME") ||
      priceDesc === "ULTIMATE"
        ? "ULTIMATE"
        : "PRO"

    const isSubscription = !!data.subscriptionId

    if (!isSubscription) {
      const existingSub = await db.query.subscription.findFirst({
        where: eq(subscription.userId, decodedOrg.id),
      })

      if (existingSub) {
        if (existingSub.subscriptionChangeAt) {
          await db.insert(purchase).values({
            id: data.id,
            userId: decodedOrg.id,
            tier: planType,
            price: priceAmount.toString(),
            currency,
            priceId,
            isActive: false,
          })
          return NextResponse.json({ ok: true })
        }
        await db
          .delete(subscription)
          .where(eq(subscription.userId, decodedOrg.id))
      }

      await db.insert(purchase).values({
        id: data.id,
        userId: decodedOrg.id,
        tier: planType,
        price: priceAmount.toString(),
        priceId,
        currency,
      })
      await syncOrgDataToRedisLinks(decodedOrg.activeOrgId, {
        ownerId: decodedOrg.id,
        planType,
        paymentType: "ONE-TIME",
        expiresAt: null,
      })
    } else {
      // SUBSCRIPTION PURCHASE logic
      const subscriptionId = data.subscriptionId
      const paddleInterval = priceInfo?.billingCycle?.interval ?? "month"
      const billingInterval = paddleInterval === "year" ? "YEARLY" : "MONTHLY"

      await db.delete(purchase).where(eq(purchase.userId, decodedOrg.id))
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

      await syncOrgDataToRedisLinks(decodedOrg.activeOrgId, {
        ownerId: decodedOrg.id,
        planType,
        paymentType: "SUBSCRIPTION",
        expiresAt: data.billingPeriod?.endsAt
          ? new Date(data.billingPeriod.endsAt).toISOString()
          : null,
      })
    }
  }

  // 🔄 Subscription updated
  if (eventType === EventName.SubscriptionUpdated) {
    const existing = await db.query.subscription.findFirst({
      where: eq(subscription.id, data.id),
    })
    if (!existing) {
      return NextResponse.json({ ok: true, skipped: "no subscription row found for " + data.id })
    }

    const userId = existing.userId

    // Prefer the token's activeOrgId if it's still valid, else fall back to the DB
    const decodedOrg = decodeOrgFromCustomData(data.customData)
    const org = decodedOrg
      ? { id: decodedOrg.activeOrgId }
      : await db.query.organization.findFirst({
          where: eq(organization.userId, userId),
        })
    if (!org) {
      return NextResponse.json({ ok: true, skipped: "no organization found" })
    }

    const nextBill = data.currentBillingPeriod?.endsAt
      ? new Date(data.currentBillingPeriod.endsAt)
      : null
    const item = data.items?.[0]
    const priceId = item?.price?.id ?? null
    const scheduled = data.scheduledChange

    if (scheduled?.action === "cancel") {
      const effectiveAt = scheduled.effectiveAt
        ? new Date(scheduled.effectiveAt)
        : null
      await db
        .update(subscription)
        .set({
          subscriptionChangeAt: effectiveAt,
          updatedAt: new Date(),
          expiresAt: nextBill,
        })
        .where(eq(subscription.userId, userId))
      await syncOrgDataToRedisLinks(org.id, {
        expiresAt: nextBill?.toISOString() ?? null,
      })
      return NextResponse.json({ ok: true, updated: "scheduled cancel" })
    }

    // renewal, resume, or plan change
    const desc = item?.price?.description || ""
    const planType: "PRO" | "ULTIMATE" = desc.includes("ULTIMATE") ? "ULTIMATE" : "PRO"
    const interval =
      item?.price?.billingCycle?.interval === "year" ? "YEARLY" : "MONTHLY"

    await db
      .update(subscription)
      .set({
        plan: planType,
        billingInterval: interval,
        priceId,
        price: item?.price?.unitPrice?.amount ?? existing.price,
        subscriptionChangeAt: null,
        expiresAt: nextBill,
        updatedAt: new Date(),
      })
      .where(eq(subscription.userId, userId))

    await syncOrgDataToRedisLinks(org.id, {
      ownerId: userId,
      planType,
      paymentType: "SUBSCRIPTION",
      expiresAt: nextBill?.toISOString() ?? null,
    })

    return NextResponse.json({ ok: true, updated: "subscription synced" })
  }

  // ❌ Subscription canceled
  if (eventType === EventName.SubscriptionCanceled) {
    const decodedOrg = await resolveOrgContext(data.id, data.customData)
    if (!decodedOrg) {
      return NextResponse.json({ ok: true, skipped: "cannot resolve user for canceled subscription" })
    }

    const pendingPurchase = await db.query.purchase.findFirst({
      where: eq(purchase.userId, decodedOrg.id),
    })

    if (pendingPurchase && pendingPurchase.isActive === false) {
      await db
        .update(purchase)
        .set({ isActive: true })
        .where(eq(purchase.userId, decodedOrg.id))
      await syncOrgDataToRedisLinks(decodedOrg.activeOrgId, {
        ownerId: decodedOrg.id,
        planType: pendingPurchase.tier,
        paymentType: "ONE-TIME",
        expiresAt: null,
      })
      await db
        .delete(subscription)
        .where(eq(subscription.userId, decodedOrg.id))
    } else {
      await db
        .update(subscription)
        .set({
          plan: "FREE",
          billingInterval: "MONTHLY",
          price: null,
          priceId: null,
          expiresAt: new Date(),
          subscriptionChangeAt: null,
          updatedAt: new Date(),
        })
        .where(eq(subscription.userId, decodedOrg.id))
      await syncOrgDataToRedisLinks(decodedOrg.activeOrgId, {
        ownerId: decodedOrg.id,
        paymentType: "SUBSCRIPTION",
        planType: "FREE",
        expiresAt: new Date().toISOString(),
      })
    }
  }

  // 🎯 Adjustment/Refund
  if (eventType === EventName.AdjustmentUpdated) {
    const { status, action, transactionId } = data
    if (status === "approved" && action === "refund") {
      const existingPurchase = await db.query.purchase.findFirst({
        where: eq(purchase.id, transactionId),
      })
      if (!existingPurchase) return NextResponse.json({ ok: true })

      const userId = existingPurchase.userId
      const userOrg = await db.query.organization.findFirst({
        where: eq(organization.userId, userId),
      })

      if (existingPurchase.isActive) {
        await db.delete(purchase).where(eq(purchase.id, transactionId))
        const remainingPurchase = await db.query.purchase.findFirst({
          where: eq(purchase.userId, userId),
          orderBy: (p, { desc }) => [desc(p.tier)],
        })
        if (!remainingPurchase && userOrg) {
          await db
            .update(subscription)
            .set({
              plan: "FREE",
              price: null,
              expiresAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(subscription.userId, userId))
          await syncOrgDataToRedisLinks(userOrg.id, {
            ownerId: userId,
            planType: "FREE",
            paymentType: "SUBSCRIPTION",
            expiresAt: new Date().toISOString(),
          })
        }
      } else {
        await db.delete(purchase).where(eq(purchase.id, transactionId))
      }
    }
  }

  return NextResponse.json({ ok: true })
})
