import { and, eq, sql } from "drizzle-orm"
import { affiliateInvoice, affiliateLink } from "@/db/schema"
import { getDB } from "@/db/drizzle"

export async function getUnpaidPayoutAction(orgId: string) {
  const db = await getDB()
  return await db
    .select({
      month:
        sql<number>`extract(month from ${affiliateInvoice.createdAt})`.mapWith(
          Number
        ),
      year: sql<number>`extract(year from ${affiliateInvoice.createdAt})`.mapWith(
        Number
      ),
      unpaid: sql<number>`sum(${affiliateInvoice.unpaidAmount})`.mapWith(
        Number
      ),
    })
    .from(affiliateInvoice)
    .innerJoin(
      affiliateLink,
      eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)
    )
    .where(
      and(
        eq(affiliateLink.organizationId, orgId),
        sql`${affiliateInvoice.unpaidAmount} > 0`
      )
    )
    .groupBy(
      sql`EXTRACT(YEAR FROM ${affiliateInvoice.createdAt})`,
      sql`EXTRACT(MONTH FROM ${affiliateInvoice.createdAt})`
    )
}
