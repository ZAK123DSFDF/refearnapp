// @/lib/server/affiliate/getAffiliateKpiStatsAction.ts
import { db } from "@/db/drizzle"
import { and, eq, sql } from "drizzle-orm"
import {
  affiliate,
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
  referrals,
} from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getAffiliateKpiStatsAction(
  orgId: string,
  affiliateId: string,
  year?: number,
  month?: number
) {
  // 1. Aggregate Clicks for this specific affiliate
  const clickSq = db
    .select({
      affiliateId: affiliate.id,
      clicks: sql`count(distinct ${affiliateClick.id})`.as("clicks"),
    })
    .from(affiliate)
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
    .leftJoin(
      affiliateClick,
      buildWhereWithDate(
        [eq(affiliateClick.affiliateLinkId, affiliateLink.id)],
        affiliateClick,
        year,
        month
      )
    )
    .where(
      and(eq(affiliate.organizationId, orgId), eq(affiliate.id, affiliateId))
    )
    .groupBy(affiliate.id)
    .as("click_sq")

  // 2. Aggregate Referrals for this specific affiliate
  const referralSq = db
    .select({
      affiliateId: affiliate.id,
      signups: sql`count(distinct ${referrals.id})`.as("signups"),
      paidReferrals:
        sql`count(distinct case when ${referrals.convertedAt} is not null then ${referrals.id} end)`.as(
          "paid_referrals"
        ),
    })
    .from(affiliate)
    .leftJoin(
      referrals,
      buildWhereWithDate(
        [eq(referrals.affiliateId, affiliate.id)],
        referrals,
        year,
        month
      )
    )
    .where(
      and(eq(affiliate.organizationId, orgId), eq(affiliate.id, affiliateId))
    )
    .groupBy(affiliate.id)
    .as("ref_sq")

  // 3. Aggregate Invoices for this specific affiliate
  const invoiceSq = db
    .select({
      affiliateId: affiliate.id,
      salesCount:
        sql`count(distinct case when ${affiliateInvoice.reason} in ('subscription_create', 'one_time') and ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.id} end)`.as(
          "sales_count"
        ),
      totalComm:
        sql`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.commission} else 0 end)`.as(
          "total_comm"
        ),
      totalPaid:
        sql`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.paidAmount} else 0 end)`.as(
          "total_paid"
        ),
      totalUnpaid:
        sql`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.unpaidAmount} else 0 end)`.as(
          "total_unpaid"
        ),
      totalAmt:
        sql`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.amount} else 0 end)`.as(
          "total_amt"
        ),
    })
    .from(affiliate)
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)],
        affiliateInvoice,
        year,
        month
      )
    )
    .where(
      and(eq(affiliate.organizationId, orgId), eq(affiliate.id, affiliateId))
    )
    .groupBy(affiliate.id)
    .as("inv_sq")

  return db
    .select({
      // We calculate totalLinks as a scalar count to avoid joining the table directly in the base
      totalLinks:
        sql<number>`(SELECT count(*) FROM ${affiliateLink} WHERE ${affiliateLink.affiliateId} = ${affiliate.id})`.mapWith(
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

      // Rates
      clickToSignupRate: sql<number>`
        coalesce((sum(${referralSq.signups})::float / nullif(sum(${clickSq.clicks}), 0)::float) * 100, 0)
      `.mapWith(Number),
      signupToPaidRate: sql<number>`
        coalesce((sum(${referralSq.paidReferrals})::float / nullif(sum(${referralSq.signups}), 0)::float) * 100, 0)
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
    .where(
      and(eq(affiliate.organizationId, orgId), eq(affiliate.id, affiliateId))
    )
    .groupBy(affiliate.id)
}
