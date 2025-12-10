// scripts/seedExchangeRates.ts
//@ts-ignore
import currencyapi from "@everapi/currencyapi-js"
import { exchangeRate } from "@/db/schema"
import { getDB } from "@/db/drizzle"

const client = new currencyapi(process.env.CURRENCY_API_KEY!)

async function fetchAndStoreExchangeRates() {
  const res = await client.latest({ base_currency: "USD", type: "fiat" })
  const now = new Date(res.meta.last_updated_at)
  const db = await getDB()
  for (const [code, info] of Object.entries(res.data)) {
    const rate = (info as { value: any }).value.toString()

    await db
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
  }
}

// 👇 auto-run with top-level await + try/catch
try {
  await fetchAndStoreExchangeRates()
  console.log("✅ Exchange rates seeded successfully")
  process.exit(0)
} catch (err) {
  console.error("❌ Error seeding exchange rates:", err)
  process.exit(1)
}
