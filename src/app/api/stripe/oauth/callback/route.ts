import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { db } from "@/db/drizzle"
import { eq } from "drizzle-orm"
import { handleRoute } from "@/lib/handleRoute"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export const GET = handleRoute("Stripe OAuth Callback", async (request) => {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const orgId = searchParams.get("state")
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  // 1. Initial Validation
  if (!code || !orgId) {
    return NextResponse.redirect(
      `${baseUrl}/organization/${orgId || "unknown"}/stripeErrorPage?message=${encodeURIComponent("Missing params")}`
    )
  }

  // 2. Exchange code for token
  // We use the Stripe response directly. If this throws, handleRoute catches it.
  const response = await stripe.oauth.token({
    grant_type: "authorization_code",
    code,
  })

  if (!response?.stripe_user_id) {
    return NextResponse.redirect(
      `${baseUrl}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent("Missing Stripe response or Account ID")}`
    )
  }

  const connectedAccountId = response.stripe_user_id

  // 3. Retrieve account details
  const account = await stripe.accounts.retrieve(connectedAccountId)

  // 4. Check for existing connection
  const existingAccount = await db.query.organizationStripeAccount.findFirst({
    where: eq(organizationStripeAccount.stripeAccountId, connectedAccountId),
  })

  if (existingAccount) {
    return NextResponse.redirect(
      `${baseUrl}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent("This Stripe account is already connected to another organization.")}`
    )
  }

  // 5. Database update
  await db
    .insert(organizationStripeAccount)
    .values({
      stripeAccountId: connectedAccountId,
      orgId,
      email: account.email ?? null,
    })
    .onConflictDoUpdate({
      target: organizationStripeAccount.stripeAccountId,
      set: {
        orgId,
        email: account.email ?? null,
        updatedAt: new Date(),
      },
    })

  // 6. Redirect to success
  return NextResponse.redirect(
    `${baseUrl}/organization/${orgId}/stripeSuccessPage?account=${connectedAccountId}`
  )
})
