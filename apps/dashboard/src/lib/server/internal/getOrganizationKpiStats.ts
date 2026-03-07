import { db } from "@/db/drizzle"
import { eq, sql, and, SQL } from "drizzle-orm"
import {
  affiliate,
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
  promotionCodes,
  referrals,
} from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getOrganizationKpiStatsAction(
  orgId: string,
  year?: number,
  month?: number
) {
  // Helper to safely handle the date filter array for Drizzle's and()
  const getDateFilters = (table: any) => {
    const filters = buildWhereWithDate([], table, year, month)
    return Array.isArray(filters) ? filters : [filters]
  }

  // 1. Total Links count for the Org (Usually not date-filtered, but added for consistency)
  const linkSq = db
    .select({
      linkCount: sql`count(distinct ${affiliateLink.id})`.as("link_count"),
      organizationId: affiliate.organizationId,
    })
    .from(affiliateLink)
    .innerJoin(affiliate, eq(affiliate.id, affiliateLink.affiliateId))
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.organizationId)
    .as("link_sq")

  // 2. Aggregate Clicks by Affiliate (Date Filtered)
  const clickSq = db
    .select({
      affiliateId: affiliateLink.affiliateId,
      clicks: sql`count(${affiliateClick.id})`.as("clicks"),
    })
    .from(affiliateClick)
    .innerJoin(
      affiliateLink,
      eq(affiliateLink.id, affiliateClick.affiliateLinkId)
    )
    .where(and(...getDateFilters(affiliateClick)))
    .groupBy(affiliateLink.affiliateId)
    .as("click_sq")

  // 3. Aggregate Referrals by Affiliate (Date Filtered)
  const referralSq = db
    .select({
      affiliateId: referrals.affiliateId,
      signups: sql<number>`count(
      case when ${referrals.convertedAt} is null then 1 end
      )`.as("signups"),
      paidReferrals: sql<number>`count(
      case when ${referrals.convertedAt} is not null then 1 end
      )`.as("paid_referrals"),
    })
    .from(referrals)
    .where(
      and(eq(referrals.organizationId, orgId), ...getDateFilters(referrals))
    )
    .groupBy(referrals.affiliateId)
    .as("ref_sq")
  // 4. Aggregate Invoices by Affiliate (Date Filtered)
  const invoiceSq = db
    .select({
      // We name this specifically so the final join can find "affiliateId"
      affiliateId:
        sql<string>`COALESCE(${affiliateLink.affiliateId}, ${promotionCodes.affiliateId})`.as(
          "sub_aff_id"
        ),
      salesCount:
        sql<number>`count(case when ${affiliateInvoice.reason} in ('subscription_create', 'one_time') and ${affiliateInvoice.refundedAt} is null then 1 end)`.as(
          "sales_count"
        ),
      totalComm:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.commission} else 0 end)`.as(
          "total_comm"
        ),
      totalPaid:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.paidAmount} else 0 end)`.as(
          "total_paid"
        ),
      totalUnpaid:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.unpaidAmount} else 0 end)`.as(
          "total_unpaid"
        ),
      totalAmt:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.amount} else 0 end)`.as(
          "total_amt"
        ),
    })
    .from(affiliateInvoice)
    .leftJoin(
      affiliateLink,
      eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)
    )
    .leftJoin(
      promotionCodes,
      eq(affiliateInvoice.promotionCodeId, promotionCodes.id)
    )
    .where(and(...getDateFilters(affiliateInvoice)))
    .groupBy(affiliateLink.affiliateId, promotionCodes.affiliateId) // Group by the actual columns to avoid COALESCE ambiguity
    .as("inv_sq")
  // 5. Final Join
  return db
    .select({
      totalAffiliates: sql<number>`count(distinct ${affiliate.id})`.mapWith(
        Number
      ),
      totalVisitors: sql<number>`coalesce(sum(${clickSq.clicks}), 0)`.mapWith(
        Number
      ),
      totalSignups:
        sql<number>`coalesce(sum(${referralSq.signups}), 0)`.mapWith(Number),
      totalPaidReferrals:
        sql<number>`coalesce(sum(${referralSq.paidReferrals}), 0)`.mapWith(
          Number
        ),
      totalLinks: sql<number>`coalesce(max(${linkSq.linkCount}), 0)`.mapWith(
        Number
      ),
      clickToSignupRate: sql<number>`
        coalesce(round(((sum(${referralSq.signups})::float / nullif(sum(${clickSq.clicks}), 0)::float) * 100)::numeric, 2), 0)
      `.mapWith(Number),
      signupToPaidRate: sql<number>`
        coalesce(round(((sum(${referralSq.paidReferrals})::float / nullif(sum(${referralSq.signups}), 0)::float) * 100)::numeric, 2), 0)
      `.mapWith(Number),
      sales: sql<number>`coalesce(sum(${invoiceSq.salesCount}), 0)`.mapWith(
        Number
      ),
      commission: sql<number>`coalesce(sum(${invoiceSq.totalComm}), 0)`.mapWith(
        Number
      ),
      paid: sql<number>`coalesce(sum(${invoiceSq.totalPaid}), 0)`.mapWith(
        Number
      ),
      unpaid: sql<number>`coalesce(sum(${invoiceSq.totalUnpaid}), 0)`.mapWith(
        Number
      ),
      amount: sql<number>`coalesce(sum(${invoiceSq.totalAmt}), 0)`.mapWith(
        Number
      ),
    })
    .from(affiliate)
    .leftJoin(clickSq, eq(clickSq.affiliateId, affiliate.id))
    .leftJoin(referralSq, eq(referralSq.affiliateId, affiliate.id))
    .leftJoin(invoiceSq, eq(invoiceSq.affiliateId, affiliate.id))
    .leftJoin(linkSq, eq(linkSq.organizationId, affiliate.organizationId))
    .where(eq(affiliate.organizationId, orgId))
}
