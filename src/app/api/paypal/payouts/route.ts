import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

export const POST = handleRoute("PayPal Payout Process", async (request) => {
  const { clientId, clientSecret } = (await request.json()) as {
    clientId: string
    clientSecret: string
  }

  // 1. Validation
  if (!clientId || !clientSecret) {
    throw new AppError({
      error: "MISSING_CREDENTIALS",
      toast: "PayPal Client ID and Secret are required",
      status: 400,
    })
  }

  // 2. Get access token
  // Note: For production, you'd switch 'sandbox' to 'api-m' based on an env var
  const authResponse = await fetch(
    "https://api.sandbox.paypal.com/v1/oauth2/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    }
  )

  if (!authResponse.ok) {
    throw new AppError({
      error: "PAYPAL_AUTH_FAILED",
      toast: "Could not authenticate with PayPal. Check your credentials.",
      status: 401,
    })
  }

  const { access_token } = (await authResponse.json()) as any

  // 3. Create payout
  const payoutResponse = await fetch(
    "https://api.sandbox.paypal.com/v1/payments/payouts",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
      },
      body: JSON.stringify({
        sender_batch_header: {
          sender_batch_id: `Payouts_${Date.now()}`,
          email_subject: "You have a payout!",
          email_message:
            "You have received a payout. Thanks for using our service!",
        },
        items: [
          {
            recipient_type: "EMAIL",
            amount: { value: "20.00", currency: "USD" },
            note: "Affiliate commission payment",
            sender_item_id: `item_${Date.now()}_1`,
            receiver: "zakm1@personal.com",
          },
          {
            recipient_type: "EMAIL",
            amount: { value: "20.00", currency: "USD" },
            note: "Affiliate commission payment",
            sender_item_id: `item_${Date.now()}_2`,
            receiver: "zakm123@personal.com",
          },
        ],
      }),
    }
  )

  const result = (await payoutResponse.json()) as any

  if (!payoutResponse.ok) {
    throw new AppError({
      error: "PAYPAL_PAYOUT_FAILED",
      toast: result.message || "Failed to process the payout batch.",
      status: payoutResponse.status,
    })
  }

  return NextResponse.json({
    ok: true,
    batchId: result.batch_header.payout_batch_id,
    status: result.batch_header.batch_status,
    toast: "Payout batch submitted successfully!",
  })
})
