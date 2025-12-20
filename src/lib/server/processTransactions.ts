// use server
import { sql, inArray, eq, and, or, isNull } from "drizzle-orm"
import { db } from "@/db/drizzle"
import {
  affiliateInvoice,
  affiliateLink,
  payoutReference,
  payoutReferencePeriods,
} from "@/db/schema"
import pLimit from "p-limit"

export interface Transaction {
  Unique_Identifier: string
  Recipient: string
  Status: string
  Amount: number
}

// Bulk update invoices for given payout refs
async function bulkUpdateInvoices(refIds: string[]) {
  if (refIds.length === 0) return { rowCount: 0 }
  const result = await db
    .update(affiliateInvoice)
    .set({
      paidAmount: sql`${affiliateInvoice.paidAmount} + ${affiliateInvoice.unpaidAmount}`,
      unpaidAmount: sql`0`,
    })
    .from(affiliateLink)
    .innerJoin(
      payoutReference,
      sql`${payoutReference.affiliateId} = ${affiliateLink.affiliateId}`
    )
    .leftJoin(
      payoutReferencePeriods,
      eq(payoutReference.refId, payoutReferencePeriods.refId)
    )
    .where(
      and(
        eq(affiliateInvoice.affiliateLinkId, affiliateLink.id),
        inArray(payoutReference.refId, refIds),
        or(
          isNull(payoutReferencePeriods.refId),
          and(
            eq(
              sql`EXTRACT(YEAR FROM ${affiliateInvoice.createdAt})`,
              payoutReferencePeriods.year
            ),
            eq(payoutReferencePeriods.month, 0)
          ),
          and(
            eq(
              sql`EXTRACT(YEAR FROM ${affiliateInvoice.createdAt})`,
              payoutReferencePeriods.year
            ),
            eq(
              sql`EXTRACT(MONTH FROM ${affiliateInvoice.createdAt})`,
              payoutReferencePeriods.month
            )
          )
        )
      )
    )
    .returning({ id: affiliateInvoice.id })
  return { rowCount: result.length }
}

// Process transactions from PayPal
export async function processTransactions(transactions: Transaction[]) {
  const completed = transactions.filter((tx) => tx.Status === "Completed")

  if (completed.length === 0) {
    console.log("No completed transactions to process.")
    return
  }
  const refIds = completed.map((tx) => tx.Unique_Identifier)
  const THRESHOLD = 5000

  if (refIds.length <= THRESHOLD) {
    const result = await bulkUpdateInvoices(refIds)
    console.log(
      `✅ Bulk update finished. Updated ${result.rowCount} invoices for ${completed.length} completed transactions.`
    )
  } else {
    const limit = pLimit(20)
    const chunkSize = 2000
    const chunks: string[][] = []

    for (let i = 0; i < refIds.length; i += chunkSize) {
      chunks.push(refIds.slice(i, i + chunkSize))
    }

    const tasks = chunks.map((chunk) =>
      limit(async () => {
        const result = await bulkUpdateInvoices(chunk)
        console.log(
          `Chunk processed (${chunk.length} refs). Updated ${result.rowCount} invoices.`
        )
      })
    )

    await Promise.all(tasks)
    console.log(
      `✅ Large batch finished. Processed ${completed.length} completed transactions for ${refIds.length} refs in ${chunks.length} chunks.`
    )
  }
}
