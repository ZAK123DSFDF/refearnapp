"use server"
import { createPolar } from "@polar-sh/sdk/2026-04"
import { headers } from "next/headers"
import { and, eq } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { purchase } from "@/db/schema"
import { handleAction } from "@/lib/handleAction"
import { AppError } from "@/lib/exceptions"
import { polarConfig } from "@/lib/polarConfig"
import { getOrganizationToken } from "@/lib/server/organization/getOrganizationToken"
import { decodeOrgFromCustomData } from "@/util/DecodeOrgFromCustomData"
import { resolveBillingProvider } from "@/lib/server/billing/resolveBillingProvider"

const polar = createPolar({
  accessToken: polarConfig.accessToken,
  environment: polarConfig.server,
})

type Input =
  | { type: "PURCHASE"; plan: "PRO" | "ULTIMATE" }
  | { type: "SUBSCRIPTION"; plan: "PRO" | "ULTIMATE"; cycle: "MONTHLY" | "YEARLY" }

export async function createPolarCheckoutAction(input: Input) {
  return handleAction("createPolarCheckoutAction", async () => {
    const token = await getOrganizationToken()
    const decoded = decodeOrgFromCustomData({ organizationToken: token })
    if (!decoded) throw new AppError({ status: 401, toast: "Please sign in again" })

    // Server decides the provider; the client can't pick one
    if ((await resolveBillingProvider(decoded.id)) !== "polar") {
      throw new AppError({ status: 403, toast: "Billing for this account is handled by Paddle" })
    }

    let productId: string | undefined
    if (input.type === "SUBSCRIPTION") {
      productId = polarConfig.productIds.SUBSCRIPTION[input.cycle][input.plan]
    } else {
      // Derived from the DB, not from client-sent state
      const ownsPro =
        input.plan === "ULTIMATE" &&
        !!(await db.query.purchase.findFirst({
          where: and(eq(purchase.userId, decoded.id), eq(purchase.tier, "PRO")),
        }))
      productId = ownsPro
        ? polarConfig.productIds.PURCHASE.ULTIMATE_UPGRADE_FROM_PRO
        : polarConfig.productIds.PURCHASE[input.plan]
    }
    if (!productId) throw new AppError({ status: 400, toast: "Product not configured" })

    const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_APP_URL!

    const checkout = await polar.checkouts.create({
      products: [productId],
      external_customer_id: decoded.id,
      embed_origin: origin,
      metadata: { userId: decoded.id, activeOrgId: decoded.activeOrgId },
    })

    return { ok: true, toast: "", data: { url: checkout.url } }
  })
}
