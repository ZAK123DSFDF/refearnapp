import { NextResponse } from "next/server"
import Stripe from "stripe"
import { organizationStripeAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-08-27.basil",
})

export async function POST(req: Request) {
  const { orgId } = await req.json()
  if (!orgId) {
    return NextResponse.json({ error: "Missing orgId" }, { status: 400 })
  }
  const db = await getDB()
  const record = await db.query.organizationStripeAccount.findFirst({
    where: eq(organizationStripeAccount.orgId, orgId),
  })

  if (!record) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 })
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
}
