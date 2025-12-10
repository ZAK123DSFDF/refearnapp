// lib/affiliateInvoice.ts
import { affiliateInvoice } from "@/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function getAffiliateTotalEarnings(
  affiliateLinkId: string
): Promise<number> {
  const db = await getDB()
  const result = await db
    .select({
      total: sql<number>`SUM(${affiliateInvoice.amount})::float`,
    })
    .from(affiliateInvoice)
    .where(
      and(
        eq(affiliateInvoice.affiliateLinkId, affiliateLinkId),
        sql`${affiliateInvoice.reason} IN ('subscription_create', 'one_time')`
      )
    )
    .limit(1)

  return result[0]?.total ?? 0
}
