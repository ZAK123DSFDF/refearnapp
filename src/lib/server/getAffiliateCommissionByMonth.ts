"use server"
import { and, eq, sql } from "drizzle-orm"
import { affiliateInvoice, affiliateLink } from "@/db/schema"
import { getDB } from "@/db/drizzle"
export async function getAffiliateCommissionByMonthAction(
  decoded: {
    id: string
    orgId: string
  },
  targetYear?: number
) {
  const db = await getDB()
  return db
    .select({
      month: sql<string>`to_char(${affiliateInvoice.createdAt}, 'YYYY-MM')`,
      linkId: affiliateLink.id,
      totalCommission: sql<number>`sum(${affiliateInvoice.commission})`.mapWith(
        Number
      ),
      paidCommission: sql<number>`sum(${affiliateInvoice.paidAmount})`.mapWith(
        Number
      ),
      unpaidCommission:
        sql<number>`sum(${affiliateInvoice.unpaidAmount})`.mapWith(Number),
    })
    .from(affiliateInvoice)
    .innerJoin(
      affiliateLink,
      eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)
    )
    .where(
      and(
        sql`extract(year from ${affiliateInvoice.createdAt}) = ${targetYear}`,
        eq(affiliateLink.organizationId, decoded.orgId),
        eq(affiliateLink.affiliateId, decoded.id)
      )
    )
    .groupBy(
      sql`to_char(${affiliateInvoice.createdAt}, 'YYYY-MM')`,
      affiliateLink.id
    )
}
