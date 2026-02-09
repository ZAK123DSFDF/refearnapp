import { db } from "@/db/drizzle"
import { affiliateInvoice } from "@/db/schema"
import { eq } from "drizzle-orm"
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

type Params = { transactionId: string }

export const GET = handleRoute<Params>(
  "Debug Get Invoice",
  async (request, params) => {
    const { transactionId } = params

    // 1. Auth check
    const authHeader = request.headers.get("x-refearn-debug-secret")
    if (authHeader !== process.env.DEBUG_SECRET) {
      throw new AppError({ error: "Unauthorized", status: 401 })
    }

    // 2. Fetch Invoice
    const invoice = await db.query.affiliateInvoice.findFirst({
      where: eq(affiliateInvoice.transactionId, transactionId),
    })

    if (!invoice) {
      throw new AppError({ error: "Invoice not found", status: 404 })
    }

    // 3. Return Data
    return NextResponse.json({
      id: invoice.transactionId,
      customer_id: invoice.customerId,
      subscription_id: invoice.subscriptionId,
      amount: invoice.amount,
      currency: "USD",
    })
  }
)
