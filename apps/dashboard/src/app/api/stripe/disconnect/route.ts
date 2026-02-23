import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

export const POST = handleRoute("Stripe Deauthorize", async (req) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  })

  const { orgId } = (await req.json()) as { orgId?: string }
  if (!orgId) {
    throw new AppError({
      error: "MISSING_ORG_ID",
      toast: "Organization ID is required",
      status: 400,
    })
  }

  const record = await db.query.organizationStripeAccount.findFirst({
    where: eq(organizationStripeAccount.orgId, orgId),
  })

  if (!record) {
    throw new AppError({
      error: "NOT_FOUND",
      toast: "No Stripe account connected for this organization",
      status: 404,
    })
  }

  await stripe.oauth.deauthorize({
    client_id: process.env.STRIPE_CLIENT_ID!,
    stripe_user_id: record.stripeAccountId,
  })

  await db
    .delete(organizationStripeAccount)
    .where(
      eq(organizationStripeAccount.stripeAccountId, record.stripeAccountId)
    )

  return NextResponse.json({ success: true })
})
