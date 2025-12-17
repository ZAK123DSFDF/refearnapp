import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-08-27.basil",
  })
  try {
    const { orgId } = await req.json()
    if (!orgId) {
      return NextResponse.json({
        connected: false,
        email: null,
        error: "Missing orgId",
      })
    }
    const db = await getDB()
    const accountId = await db.query.organizationStripeAccount.findFirst({
      where: eq(organizationStripeAccount.orgId, orgId),
    })
    if (!accountId) {
      return NextResponse.json({
        connected: false,
        email: null,
      })
    }
    const account = await stripe.accounts.retrieve(accountId.stripeAccountId)
    return NextResponse.json({ connected: true, email: account.email })
  } catch (err: any) {
    console.error("Stripe Status Error:", err)
    return NextResponse.json({
      connected: false,
      email: null,
      error: err.message ?? "Unable to fetch Stripe status",
    })
  }
}
