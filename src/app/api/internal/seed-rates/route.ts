import { NextResponse } from "next/server"
//@ts-ignore
import currencyapi from "@everapi/currencyapi-js"
import { db } from "@/db/drizzle"
import { exchangeRate } from "@/db/schema"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

export const POST = handleRoute("Update Exchange Rates", async (req) => {
  // 1. Security Check
  const secret = req.headers.get("x-internal-secret")
  if (secret !== process.env.INTERNAL_SECRET) {
    throw new AppError({
      error: "UNAUTHORIZED",
      toast: "Invalid internal secret",
      status: 401,
    })
  }

  const client = new currencyapi(process.env.CURRENCY_API_KEY!)
  const res = await client.latest({ base_currency: "USD", type: "fiat" })

  if (!res?.data) {
    throw new AppError({
      error: "API_ERROR",
      toast: "Failed to fetch data from Currency API",
      status: 502,
    })
  }

  const now = new Date(res.meta.last_updated_at)

  // 2. Database Update Logic
  // Using Promise.all to make these updates run in parallel (faster)
  await Promise.all(
    Object.entries(res.data).map(async ([code, info]: [string, any]) => {
      const rate = info.value.toString()

      return db
        .insert(exchangeRate)
        .values({
          baseCurrency: "USD",
          targetCurrency: code,
          rate,
          fetchedAt: now,
        })
        .onConflictDoUpdate({
          target: [exchangeRate.baseCurrency, exchangeRate.targetCurrency],
          set: {
            rate,
            fetchedAt: now,
          },
        })
    })
  )

  return NextResponse.json({
    ok: true,
    toast: "Exchange rates updated successfully",
  })
})
