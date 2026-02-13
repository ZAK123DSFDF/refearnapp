import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { db } from "@/db/drizzle"
import { handleRoute } from "@/lib/handleRoute"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export const GET = handleRoute("Stripe OAuth Callback", async (request) => {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const orgId = searchParams.get("state")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!code || !orgId) {
    return NextResponse.redirect(
      `${baseUrl}/organization/${orgId || "unknown"}/stripeErrorPage?message=${encodeURIComponent("Missing params")}`
    )
  }

  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  })
  const connectedAccountId = response.stripe_user_id
  if (!connectedAccountId) {
    throw new Error("Stripe did not return a user ID")
  }

  const account = await stripe.accounts.retrieve(connectedAccountId)
  await db
    .insert(organizationStripeAccount)
    .values({
      stripeAccountId: connectedAccountId,
      orgId: orgId,
      email: account.email ?? null,
    })
    .onConflictDoUpdate({
      target: [
        organizationStripeAccount.stripeAccountId,
        organizationStripeAccount.orgId,
      ],
      set: {
        email: account.email ?? null,
        updatedAt: new Date(),
      },
    })

  return NextResponse.redirect(
    `${baseUrl}/organization/${orgId}/stripeSuccessPage?account=${connectedAccountId}`
  )
})
