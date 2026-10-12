import { webhooks } from "@polar-sh/sdk/2026-04"
import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { organization, purchase, subscription, user } from "@/db/schema"
import { syncOrgDataToRedisLinks } from "@/lib/server/organization/syncOrgDataToRedisLinks"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"
import { polarConfig, resolvePolarProduct } from "@/lib/polarConfig"

type PolarEvent = Awaited<ReturnType<typeof webhooks.validateEvent>>
type DataOf<T extends PolarEvent["type"]> = Extract<PolarEvent, { type: T }>["data"]
type SubscriptionData = DataOf<"subscription.active">
type OrderData = DataOf<"order.paid">
type Metadata = Record<string, string | number | boolean> | null | undefined
type RedisPayload = Parameters<typeof syncOrgDataToRedisLinks>[1]

/* ----------------------------- helpers ----------------------------- */

const metaString = (meta: Metadata, key: string): string | null => {
  const value = meta?.[key]
  return typeof value === "string" && value.length > 0 ? value : null
}

// Metadata is set server-side in createPolarCheckoutAction; external_id is the fallback
async function findOwnerId(meta: Metadata, externalId?: string | null) {
  const id = metaString(meta, "userId") ?? externalId ?? null
  if (!id) return null
  const owner = await db.query.user.findFirst({
    where: eq(user.id, id),
    columns: { id: true },
  })
  return owner?.id ?? null
}

async function getOrgId(userId: string, meta: Metadata) {
  const fromMeta = metaString(meta, "activeOrgId")
  if (fromMeta) return fromMeta
  const org = await db.query.organization.findFirst({
    where: eq(organization.userId, userId),
    columns: { id: true },
  })
  return org?.id ?? null
}

async function syncRedis(orgId: string | null, payload: RedisPayload) {
  if (!orgId) return console.warn("⚠️ No organization to sync for Polar event")
  await syncOrgDataToRedisLinks(orgId, payload)
}

/* ------------------- subscription.active (new / recovered) ------------------- */

async function onSubscriptionActive(sub: SubscriptionData) {
  const product = resolvePolarProduct(sub.product_id)
  if (product?.kind !== "SUBSCRIPTION") return

  const userId = await findOwnerId(sub.metadata, sub.customer.external_id)
  if (!userId) return console.log("❌ Polar subscription without a known user", sub.id)

  const existing = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })
  // Never overwrite a live Paddle subscription
  if (existing && existing.plan !== "FREE" && (existing.provider ?? "paddle") === "paddle") {
    return console.error("❌ Polar subscription for a user still on Paddle", userId)
  }

  const expiresAt = new Date(sub.current_period_end)
  const fields = {
    plan: product.plan,
    billingInterval: product.interval,
    price: String(sub.amount),
    priceId: sub.product_id,
    expiresAt,
    subscriptionChangeAt: sub.cancel_at_period_end
      ? new Date(sub.ends_at ?? sub.current_period_end)
      : null,
    updatedAt: new Date(),
  }

  // Same as Paddle: a new subscription clears old purchases (skipped if a switch is pending)
  if (!existing?.subscriptionChangeAt) {
    await db.delete(purchase).where(eq(purchase.userId, userId))
  }

  // Update-or-insert: the one-time path deletes the subscription row
  const updated = await db
    .update(subscription)
    .set({ ...fields, id: sub.id, provider: "polar" })
    .where(eq(subscription.userId, userId))
    .returning({ id: subscription.id })
  if (updated.length === 0) {
    await db.insert(subscription).values({ ...fields, id: sub.id, userId, provider: "polar" })
  }

  await syncRedis(await getOrgId(userId, sub.metadata), {
    ownerId: userId,
    planType: product.plan,
    paymentType: "SUBSCRIPTION",
    expiresAt: expiresAt.toISOString(),
  })
}

/* ------- subscription.updated / canceled / uncanceled (idempotent sync) ------- */

async function onSubscriptionSync(sub: SubscriptionData) {
  if (sub.status !== "active" && sub.status !== "trialing") return

  // Matching on the id ignores stale events from an older subscription
  const existing = await db.query.subscription.findFirst({
    where: eq(subscription.id, sub.id),
  })
  if (!existing) return

  const product = resolvePolarProduct(sub.product_id)
  const newPlan =
    product?.kind === "SUBSCRIPTION" && sub.product_id !== existing.priceId ? product : null

  const expiresAt = new Date(sub.current_period_end)
  await db
    .update(subscription)
    .set({
      ...(newPlan && {
        plan: newPlan.plan,
        billingInterval: newPlan.interval,
        price: String(sub.amount),
        priceId: sub.product_id,
      }),
      expiresAt,
      subscriptionChangeAt: sub.cancel_at_period_end
        ? new Date(sub.ends_at ?? sub.current_period_end)
        : null,
      updatedAt: new Date(),
    })
    .where(eq(subscription.id, sub.id))

  await syncRedis(await getOrgId(existing.userId, sub.metadata), {
    ...(newPlan && {
      ownerId: existing.userId,
      planType: newPlan.plan,
      paymentType: "SUBSCRIPTION" as const,
    }),
    expiresAt: expiresAt.toISOString(),
  })
}

/* ------------------ subscription.revoked (access ends now) ------------------ */

async function onSubscriptionRevoked(sub: SubscriptionData) {
  const existing = await db.query.subscription.findFirst({
    where: eq(subscription.id, sub.id),
  })
  if (!existing) return

  const userId = existing.userId
  const orgId = await getOrgId(userId, sub.metadata)
  const pending = await db.query.purchase.findFirst({
    where: eq(purchase.userId, userId),
  })

  if (pending && pending.isActive === false) {
    // ULTIMATE -> PRO bundle: the deferred one-time purchase takes over now
    await db.update(purchase).set({ isActive: true }).where(eq(purchase.userId, userId))
    await syncRedis(orgId, {
      ownerId: userId,
      planType: pending.tier,
      paymentType: "ONE-TIME",
      expiresAt: null,
    })
    await db.delete(subscription).where(eq(subscription.userId, userId))
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
      .where(eq(subscription.userId, userId))
    await syncRedis(orgId, {
      ownerId: userId,
      paymentType: "SUBSCRIPTION",
      planType: "FREE",
      expiresAt: new Date().toISOString(),
    })
  }
}

/* ------------------------ order.paid (one-time only) ------------------------ */

async function onOrderPaid(order: OrderData) {
  // Subscription charges are handled by the subscription.* events
  if (order.billing_reason !== "purchase") return

  const product = resolvePolarProduct(order.product_id)
  if (product?.kind !== "PURCHASE") return

  const userId = await findOwnerId(order.metadata, order.customer.external_id)
  if (!userId) return console.log("❌ Polar order without a known user", order.id)

  // Polar retries deliveries, so this must be idempotent
  const already = await db.query.purchase.findFirst({ where: eq(purchase.id, order.id) })
  if (already) return

  const values = {
    id: order.id,
    userId,
    tier: product.plan,
    price: String(order.net_amount),
    currency: order.currency.toUpperCase(),
    priceId: order.product_id,
    provider: "polar" as const,
  }

  const existingSub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })
  if (existingSub) {
    if (existingSub.subscriptionChangeAt) {
      // Subscription still running until period end: store the purchase as pending
      await db.insert(purchase).values({ ...values, isActive: false })
      return
    }
    await db.delete(subscription).where(eq(subscription.userId, userId))
  }

  await db.insert(purchase).values(values)
  await syncRedis(await getOrgId(userId, order.metadata), {
    ownerId: userId,
    planType: product.plan,
    paymentType: "ONE-TIME",
    expiresAt: null,
  })
}

/* --------------------------- order.refunded --------------------------- */

async function onOrderRefunded(order: OrderData) {
  if (order.status !== "refunded") return // partial refunds are ignored

  const existingPurchase = await db.query.purchase.findFirst({
    where: eq(purchase.id, order.id),
  })
  if (!existingPurchase) return

  const userId = existingPurchase.userId
  await db.delete(purchase).where(eq(purchase.id, order.id))
  if (!existingPurchase.isActive) return

  const remaining = await db.query.purchase.findFirst({
    where: eq(purchase.userId, userId),
    orderBy: (p, { desc }) => [desc(p.tier)],
  })
  if (remaining) return

  await db
    .update(subscription)
    .set({ plan: "FREE", price: null, expiresAt: new Date(), updatedAt: new Date() })
    .where(eq(subscription.userId, userId))
  await syncRedis(await getOrgId(userId, order.metadata), {
    ownerId: userId,
    planType: "FREE",
    paymentType: "SUBSCRIPTION",
    expiresAt: new Date().toISOString(),
  })
}

/* ------------------------------- route ------------------------------- */

export const POST = handleRoute("Polar Webhook", async (req) => {
  const rawBody = await req.text()
  if (!rawBody) {
    throw new AppError({ error: "BAD_REQUEST", toast: "Missing body", status: 400 })
  }

  let event: PolarEvent
  try {
    event = await webhooks.validateEvent(
      rawBody,
      Object.fromEntries(req.headers),
      polarConfig.webhookSecret
    )
  } catch (error) {
    if (error instanceof webhooks.PolarWebhookVerificationError) {
      throw new AppError({ error: "FORBIDDEN", toast: "Invalid signature", status: 403 })
    }
    // Valid signature but a type this SDK doesn't know, or a malformed payload:
    // retrying can't fix it, so acknowledge it
    if (error instanceof webhooks.PolarWebhookError) {
      console.warn("⚠️ Ignoring unsupported Polar event", error)
      return NextResponse.json({ ok: true })
    }
    throw error // a real bug: let handleRoute return 500 so Polar retries
  }

  switch (event.type) {
    case "subscription.active":
      await onSubscriptionActive(event.data)
      break
    case "subscription.updated":
    case "subscription.canceled":
    case "subscription.uncanceled":
      await onSubscriptionSync(event.data)
      break
    case "subscription.revoked":
      await onSubscriptionRevoked(event.data)
      break
    case "order.paid":
      await onOrderPaid(event.data)
      break
    case "order.refunded":
      await onOrderRefunded(event.data)
      break
  }

  return NextResponse.json({ ok: true })
})
