import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

export const POST = handleRoute("Stripe OAuth Init", async (req) => {
  const { orgId } = (await req.json()) as { orgId?: string }

  // 1. Validation
  if (!orgId) {
    throw new AppError({
      error: "MISSING_ORG_ID",
      toast: "Organization ID is required to connect Stripe",
      status: 400,
    })
  }

  // 2. Env check (Safety for self-hosted users)
  const client_id = process.env.STRIPE_CLIENT_ID
  const redirect_uri = `${process.env.NEXT_PUBLIC_BASE_URL}/api/stripe/oauth/callback`

  if (!client_id) {
    throw new AppError({
      error: "STRIPE_NOT_CONFIGURED",
      toast: "Stripe Client ID is not configured on the server",
      status: 500,
    })
  }

  // 3. Generate the URL
  const stripeUrl = `https://connect.stripe.com/oauth/authorize?response_type=code&client_id=${client_id}&scope=read_write&redirect_uri=${encodeURIComponent(
    redirect_uri
  )}&state=${orgId}`

  // Return ok: true so useAppMutation knows it's a success
  return NextResponse.json({
    ok: true,
    url: stripeUrl,
  })
})
