// scripts/check-affiliate-invoices.ts
import { db } from "@/db/drizzle"
import { affiliateInvoice, affiliateLink } from "@/db/schema"
import { eq, and, isNull } from "drizzle-orm"

async function runAffiliateSanityCheck() {
  const TARGET_AFFILIATE_ID = "a85777da-fb19-4488-a053-f3367798308b" // 👈 Put the Affiliate ID here

  console.log(
    `🚀 Starting Sanity Check for Affiliate: ${TARGET_AFFILIATE_ID}...`
  )

  const results = await db
    .select({
      invoiceId: affiliateInvoice.id,
      linkId: affiliateInvoice.affiliateLinkId,
      commission: affiliateInvoice.commission,
      unpaid: affiliateInvoice.unpaidAmount,
      paid: affiliateInvoice.paidAmount,
      total: affiliateInvoice.amount,
      createdAt: affiliateInvoice.createdAt,
    })
    .from(affiliateInvoice)
    .innerJoin(
      affiliateLink,
      eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)
    )
    .where(
      and(
        eq(affiliateLink.affiliateId, TARGET_AFFILIATE_ID),
        isNull(affiliateInvoice.refundedAt)
      )
    )

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

  if (results.length > 0) {
    console.table(results)
  } else {
    console.log("⚠️ No invoices found for this affiliate.")
  }

  console.log("\n--- AFFILIATE TOTALS (CLEAN SUM) ---")
  console.log(`Total Invoices:  ${totals.count}`)
  console.log(`Commission:      $${totals.commission.toFixed(2)}`)
  console.log(`Unpaid Amount:   $${totals.unpaid.toFixed(2)}`)
  console.log(`Paid Amount:     $${totals.paid.toFixed(2)}`)
  console.log(`Generated Rev:   $${totals.amount.toFixed(2)}`)

  process.exit(0)
}

runAffiliateSanityCheck().catch((err) => {
  console.error("❌ Script failed:", err)
  process.exit(1)
})
