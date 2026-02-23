import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { handleRoute } from "@/lib/handleRoute"

export const POST = handleRoute("Get Stripe Status", async (req) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  })
  const { orgId } = (await req.json()) as { orgId?: string }

  // 1. Validation check
  if (!orgId) {
    return NextResponse.json({
      connected: false,
      email: null,
      toast: "Missing organization ID",
    })
  }

  // 2. Database lookup
  const accountRecord = await db.query.organizationStripeAccount.findFirst({
    where: eq(organizationStripeAccount.orgId, orgId),
  })

  // 3. Logic: If no record in DB, they aren't connected
  if (!accountRecord) {
    return NextResponse.json({
      ok: true,
      connected: false,
      email: null,
    })
  }

  // 4. External Check: Fetch the actual account from Stripe
  const account = await stripe.accounts.retrieve(accountRecord.stripeAccountId)

  return NextResponse.json({
    ok: true,
    connected: true,
    email: account.email,
  })
})
