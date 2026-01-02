import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = (await request.json()) as any

    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials are required")
    }

    // Get access token with user's credentials
    const authResponse = await fetch(
      "https://api.sandbox.paypal.com/v1/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${clientId}:${clientSecret}`
          ).toString("base64")}`,
        },
        body: "grant_type=client_credentials",
      }
    )

    if (!authResponse.ok) {
      throw new Error("Failed to authenticate with PayPal")
    }

    const { access_token } = (await authResponse.json()) as any

    // Create payout (rest of your existing code)
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
              amount: {
                value: "20.00",
                currency: "USD",
              },
              note: "Affiliate commission payment",
              sender_item_id: `item_${Date.now()}_1`,
              receiver: "zakm1@personal.com",
            },
            {
              recipient_type: "EMAIL",
              amount: {
                value: "20.00",
                currency: "USD",
              },
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
      throw new Error(result.message || "Failed to process payout")
    }

    return NextResponse.json({
      success: true,
      batchId: result.batch_header.payout_batch_id,
      status: result.batch_header.batch_status,
    })
  } catch (err: any) {
    console.error("PayPal Payout Error:", err)
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process payout",
      },
      { status: 500 }
    )
  }
}
