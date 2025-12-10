import { and, eq } from "drizzle-orm"
import { exchangeRate } from "@/db/schema"
import { getDB } from "@/db/drizzle"
export async function convertToUSD(
  amountSmallestUnit: number,
  currencyCode: string,
  decimals: number = 2
): Promise<{ amount: string; currency: string }> {
  const currency = currencyCode.toUpperCase()
  const db = await getDB()
  const [rateRow] = await db
    .select()
    .from(exchangeRate)
    .where(
      and(
        eq(exchangeRate.baseCurrency, "USD"),
        eq(exchangeRate.targetCurrency, currency)
      )
    )

  if (!rateRow) {
    throw new Error(`Exchange rate for ${currency} not found.`)
  }

  const rate = parseFloat(rateRow.rate)
  const amount = amountSmallestUnit / 10 ** decimals
  const usdAmount = amount / rate

  return {
    amount: String(parseFloat(usdAmount.toFixed(2))),
    currency: "USD",
  }
}
