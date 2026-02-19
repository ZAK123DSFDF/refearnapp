// scripts/check-invoices.ts
import { db } from "@/db/drizzle"
import { affiliateInvoice } from "@/db/schema"
import { sql, eq, and, isNull } from "drizzle-orm"

async function runSanityCheck() {
  const TARGET_ORG_ID = "tp7JLBb5" // 👈 Put your Org ID here

  console.log(`🚀 Starting Sanity Check for Org: ${TARGET_ORG_ID}...`)

  const results = await db
    .select({
      id: affiliateInvoice.id,
      commission: affiliateInvoice.commission,
      unpaid: affiliateInvoice.unpaidAmount,
      paid: affiliateInvoice.paidAmount,
      total: affiliateInvoice.amount,
    })
    .from(affiliateInvoice)
    // Add logic here to filter by org if your schema has organizationId
    // or join via affiliateLink if it doesn't.
    // Assuming you want a raw sum of everything for now to test:
    .where(isNull(affiliateInvoice.refundedAt))

  const totals = results.reduce(
    (acc, curr) => ({
      commission: acc.commission + Number(curr.commission),
      unpaid: acc.unpaid + Number(curr.unpaid),
      paid: acc.paid + Number(curr.paid),
      amount: acc.amount + Number(curr.total),
      count: acc.count + 1,
    }),
    { commission: 0, unpaid: 0, paid: 0, amount: 0, count: 0 }
  )

  console.table(results) // This will print every invoice in a nice table

  console.log("\n--- FINAL TOTALS (CLEAN SUM) ---")
  console.log(`Total Invoices: ${totals.count}`)
  console.log(`Total Commission: $${totals.commission.toFixed(2)}`)
  console.log(`Total Unpaid:     $${totals.unpaid.toFixed(2)}`)
  console.log(`Total Paid:       $${totals.paid.toFixed(2)}`)
  console.log(`Total Revenue:    $${totals.amount.toFixed(2)}`)

  process.exit(0)
}

runSanityCheck().catch((err) => {
  console.error("❌ Script failed:", err)
  process.exit(1)
})
