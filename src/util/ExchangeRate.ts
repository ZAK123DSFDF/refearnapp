"use server"
import { getDB } from "@/db/drizzle"

export const ExchangeRate = async (targetCurrency: string) => {
  let rate = 1
  const db = await getDB()
  if (targetCurrency !== "USD") {
    const record = await db.query.exchangeRate.findFirst({
      where: (r, { eq, and }) =>
        and(eq(r.baseCurrency, "USD"), eq(r.targetCurrency, targetCurrency)),
      orderBy: (r, { desc }) => desc(r.fetchedAt),
    })
    if (!record) {
      console.warn(`No exchange rate found for USD → ${targetCurrency}`)
      return 1
    }
    if (record) rate = Number(record.rate)
  }
  return rate
}
