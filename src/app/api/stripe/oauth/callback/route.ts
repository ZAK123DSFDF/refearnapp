import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const orgId = searchParams.get("orgId")
  const db = await getDB()
  if (!code || !orgId) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId || "unknown"}/stripeErrorPage?message=${encodeURIComponent("Missing params")}`
    )
  }

  try {
    const response = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    })

    if (!response) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent("Missing Stripe response")}`
      )
    }

    const connectedAccountId = response.stripe_user_id
    if (!connectedAccountId) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent("Missing connected account ID")}`
      )
    }

    const account = await stripe.accounts.retrieve(connectedAccountId)

    const existingAccount = await db.query.organizationStripeAccount.findFirst({
      where: eq(organizationStripeAccount.stripeAccountId, connectedAccountId),
    })

    if (existingAccount) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent("This Stripe account is already connected to another organization.")}`
      )
    }

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

    // ✅ Redirect to success page scoped to orgId
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/stripeSuccessPage?account=${connectedAccountId}`
    )
  } catch (error: any) {
    console.error("Stripe OAuth Error:", error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/stripeErrorPage?message=${encodeURIComponent(error.message || "Unexpected error")}`
    )
  }
}
