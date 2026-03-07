import { db } from "@/db/drizzle"
import { eq, sql, and, or } from "drizzle-orm"
import {
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
  promotionCodes,
  referrals,
} from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getAffiliateKpiStatsAction(
  orgId: string,
  affiliateId: string,
  year?: number,
  month?: number
) {
  const getDateFilters = (table: any) => {
    const filters = buildWhereWithDate([], table, year, month)
    return Array.isArray(filters) ? filters : [filters]
  }

  // 1. Total Links count
  const totalLinks = await db
    .select({ count: sql<number>`count(*)` })
    .from(affiliateLink)
    .where(eq(affiliateLink.affiliateId, affiliateId))
    .then((res) => res[0]?.count ?? 0)

  // 2. Clicks (Scoped)
  const clickSq = db
    .select({
      clicks: sql<number>`count(${affiliateClick.id})`.as("clicks"),
    })
    .from(affiliateClick)
    .innerJoin(
      affiliateLink,
      eq(affiliateLink.id, affiliateClick.affiliateLinkId)
    )
    .where(
      and(
        eq(affiliateLink.affiliateId, affiliateId),
        ...getDateFilters(affiliateClick)
      )
    )
    .as("click_sq")

  // 3. Referrals (Scoped)
  const referralSq = db
    .select({
      signups:
        sql<number>`count(case when ${referrals.convertedAt} is null then 1 end)`.as(
          "signups"
        ),
      paidReferrals:
        sql<number>`count(case when ${referrals.convertedAt} is not null then 1 end)`.as(
          "paid_referrals"
        ),
    })
    .from(referrals)
    .where(
      and(
        eq(referrals.affiliateId, affiliateId),
        eq(referrals.organizationId, orgId),
        ...getDateFilters(referrals)
      )
    )
    .as("ref_sq")

  // 4. Invoices (Scoped to Org/Affiliate via links or promo codes)
  const invoiceSq = db
    .select({
      salesCount:
        sql<number>`count(case when ${affiliateInvoice.reason} in ('subscription_create', 'one_time') and ${affiliateInvoice.refundedAt} is null then 1 end)`.as(
          "sales_count"
        ),
      totalComm:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.commission}::numeric else 0 end)`.as(
          "total_comm"
        ),
      totalPaid:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.paidAmount}::numeric else 0 end)`.as(
          "total_paid"
        ),
      totalUnpaid:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.unpaidAmount}::numeric else 0 end)`.as(
          "total_unpaid"
        ),
      totalAmt:
        sql<number>`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.amount}::numeric else 0 end)`.as(
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
    .where(
      and(
        or(
          eq(affiliateLink.affiliateId, affiliateId),
          eq(promotionCodes.affiliateId, affiliateId)
        ),
        ...getDateFilters(affiliateInvoice)
      )
    )
    .as("inv_sq")

  // 5. Final Join with Numeric Casting
  return db
    .select({
      totalLinks: sql`${totalLinks}`.mapWith(Number),
      totalVisitors: sql<number>`coalesce(${clickSq.clicks}, 0)`.mapWith(
        Number
      ),
      totalSignups: sql<number>`coalesce(${referralSq.signups}, 0)`.mapWith(
        Number
      ),
      totalPaidReferrals:
        sql<number>`coalesce(${referralSq.paidReferrals}, 0)`.mapWith(Number),
      sales: sql<number>`coalesce(${invoiceSq.salesCount}, 0)`.mapWith(Number),
      commission: sql<number>`coalesce(${invoiceSq.totalComm}, 0)`.mapWith(
        Number
      ),
      paid: sql<number>`coalesce(${invoiceSq.totalPaid}, 0)`.mapWith(Number),
      unpaid: sql<number>`coalesce(${invoiceSq.totalUnpaid}, 0)`.mapWith(
        Number
      ),
      amount: sql<number>`coalesce(${invoiceSq.totalAmt}, 0)`.mapWith(Number),

      // Fixed: Cast to numeric BEFORE rounding
      clickToSignupRate:
        sql<number>`coalesce(round(((coalesce(${referralSq.signups}, 0)::numeric / nullif(coalesce(${clickSq.clicks}, 0), 0)::numeric) * 100), 2), 0)`.mapWith(
          Number
        ),
      signupToPaidRate:
        sql<number>`coalesce(round(((coalesce(${referralSq.paidReferrals}, 0)::numeric / nullif(coalesce(${referralSq.signups}, 0), 0)::numeric) * 100), 2), 0)`.mapWith(
          Number
        ),
    })
    .from(clickSq)
    .leftJoin(referralSq, sql`1=1`)
    .leftJoin(invoiceSq, sql`1=1`)
}
