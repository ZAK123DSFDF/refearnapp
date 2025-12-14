import type { DrizzleD1Database } from "drizzle-orm/d1"
import { exchangeRate } from "@/db/schema"
async function fetchExchangeRates(apiKey: string): Promise<any> {
  const apiURL = `https://api.currencyapi.com/v3/latest?apikey=${apiKey}&base_currency=USD&type=fiat`

  const response = await fetch(apiURL, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch exchange rates: ${response.statusText}`)
  }

  return response.json()
}

/**
 * Fetches exchange rates from the API and stores them in the D1 database.
 * @param db The Drizzle D1 client instance.
 * @param apiKey The Currency API key from the environment.
 */
export async function runCurrencySeed(
  db: DrizzleD1Database<Record<string, never>>,
  apiKey: string
) {
  console.log("Fetching and storing exchange rates...")

  if (!apiKey) {
    console.error("CURRENCY_API_KEY is missing!")
    throw new Error("CURRENCY_API_KEY required for currency seed.")
  }
  const res = await fetchExchangeRates(apiKey)
  const now = new Date(res.meta.last_updated_at)
  const seedOperations: ReturnType<typeof db.batch>[0] = []
  for (const [code, info] of Object.entries(res.data)) {
    const rate = (info as { value: any }).value.toString()
    seedOperations.push(
      db
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
    )
  }
  await db.batch(seedOperations)
  console.log("✅ Exchange rates seeded successfully.")
}
