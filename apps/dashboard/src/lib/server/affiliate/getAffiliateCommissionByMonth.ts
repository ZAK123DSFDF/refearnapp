import { db } from "@/db/drizzle"
import { and, eq, isNull, or, sql } from "drizzle-orm"
import { affiliateInvoice, affiliateLink, promotionCodes } from "@/db/schema"
export async function getAffiliateCommissionByMonthAction(
  decoded: { id: string; orgId: string },
  targetYear?: number
) {
  return (
    db
      .select({
        month: sql<string>`to_char(${affiliateInvoice.createdAt}, 'YYYY-MM')`,
        // Coalesce or group by linkId; promo-only sales will show null here
        linkId: affiliateLink.id,
        totalCommission: sql<number>`
        sum(CASE WHEN ${affiliateInvoice.refundedAt} IS NULL THEN ${affiliateInvoice.commission} ELSE 0 END)
      `.mapWith(Number),
        paidCommission: sql<number>`
        sum(CASE WHEN ${affiliateInvoice.refundedAt} IS NULL THEN ${affiliateInvoice.paidAmount} ELSE 0 END)
      `.mapWith(Number),
        unpaidCommission: sql<number>`
        sum(CASE WHEN ${affiliateInvoice.refundedAt} IS NULL THEN ${affiliateInvoice.unpaidAmount} ELSE 0 END)
      `.mapWith(Number),
      })
      .from(affiliateInvoice)
      // Use Left Joins to include BOTH sources
      .leftJoin(
        affiliateLink,
        eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)
      )
      .leftJoin(
        promotionCodes,
        eq(affiliateInvoice.promotionCodeId, promotionCodes.id)
      )
      .where(
        and(
          sql`extract(year from ${affiliateInvoice.createdAt}) = ${targetYear}`,
          or(
            and(
              eq(affiliateLink.organizationId, decoded.orgId),
              eq(affiliateLink.affiliateId, decoded.id)
            ),
            and(
              eq(promotionCodes.organizationId, decoded.orgId),
              eq(promotionCodes.affiliateId, decoded.id)
            )
          ),
          isNull(affiliateInvoice.refundedAt)
        )
      )
      .groupBy(
        sql`to_char(${affiliateInvoice.createdAt}, 'YYYY-MM')`,
        affiliateLink.id
      )
  )
}
