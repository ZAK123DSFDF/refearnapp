import { getDB } from "@/db/drizzle"

export async function convertUsdToCurrency(
  amountUsd: number,
  targetCurrency: string
): Promise<number> {
  if (targetCurrency === "USD") return amountUsd
  const db = await getDB()
  const rateRow = await db.query.exchangeRate.findFirst({
    where: (r, { eq, and }) =>
      and(eq(r.baseCurrency, "USD"), eq(r.targetCurrency, targetCurrency)),
  })

  if (!rateRow) {
    console.warn(
      `⚠️ No exchange rate found for USD -> ${targetCurrency}, falling back to USD`
    )
    return amountUsd
  }

  const rate = parseFloat(rateRow.rate)
  return amountUsd * rate
}
