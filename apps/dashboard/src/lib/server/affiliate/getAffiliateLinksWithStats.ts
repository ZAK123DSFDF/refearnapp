import { db } from "@/db/drizzle"
import {
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
  organization,
  promotionCodes,
  referrals,
} from "@/db/schema"
import { and, eq, or, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getAffiliateLinksWithStatsAction(
  decoded: { id: string; orgId: string },
  year?: number,
  month?: number
) {
  // Helper to safely handle the date filter array for Drizzle's and()
  const getDateFilters = (table: any) => {
    const filters = buildWhereWithDate([], table, year, month)
    return Array.isArray(filters) ? filters : [filters]
  }

  // 1. Clicks Subquery (Aggregated by Link)
  const clicksSq = db
    .select({
      linkId: affiliateClick.affiliateLinkId,
      clicks: sql`count(${affiliateClick.id})`.as("clicks"),
    })
    .from(affiliateClick)
    .where(and(...getDateFilters(affiliateClick)))
    .groupBy(affiliateClick.affiliateLinkId)
    .as("clicks_sq")

  // 2. Referrals Subquery (Aggregated by Link)
  const referralsSq = db
    .select({
      linkId: referrals.affiliateLinkId,
      signups:
        sql`count(case when ${referrals.convertedAt} is null then 1 end)`.as(
          "signups"
        ),
      paidReferrals:
        sql`count(case when ${referrals.convertedAt} is not null then 1 end)`.as(
          "paid_referrals"
        ),
    })
    .from(referrals)
    .where(
      and(
        eq(referrals.organizationId, decoded.orgId),
        ...getDateFilters(referrals)
      )
    )
    .groupBy(referrals.affiliateLinkId)
    .as("referrals_sq")
  const attributionSq = db
    .select({
      linkId: affiliateLink.id,
      promoId: promotionCodes.id,
    })
    .from(affiliateLink)
    .leftJoin(
      promotionCodes,
      eq(promotionCodes.affiliateId, affiliateLink.affiliateId)
    )
    .where(
      and(
        eq(affiliateLink.affiliateId, decoded.id),
        eq(affiliateLink.organizationId, decoded.orgId)
      )
    )
    .as("attr_sq")
  // 3. Invoices Subquery (Aggregated by Link)
  const invoicesSq = db
    .select({
      // We group by linkId to match the outer select's structure
      linkId: attributionSq.linkId,
      salesCount:
        sql`count(case when ${affiliateInvoice.reason} in ('subscription_create', 'one_time') and ${affiliateInvoice.refundedAt} is null then 1 end)`.as(
          "sales_count"
        ),
      totalComm:
        sql`sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.commission} else 0 end)`.as(
          "total_comm"
        ),
    })
    .from(affiliateInvoice)
    .leftJoin(
      attributionSq,
      or(
        eq(affiliateInvoice.affiliateLinkId, attributionSq.linkId),
        eq(affiliateInvoice.promotionCodeId, attributionSq.promoId)
      )
    )
    .where(and(...getDateFilters(affiliateInvoice)))
    .groupBy(attributionSq.linkId)
    .as("invoices_sq")

  // 4. Final Join returning data per link
  return db
    .select({
      id: affiliateLink.id,
      createdAt: affiliateLink.createdAt,
      clicks: sql<number>`coalesce(${clicksSq.clicks}, 0)`.mapWith(Number),
      signups: sql<number>`coalesce(${referralsSq.signups}, 0)`.mapWith(Number),
      paidReferrals:
        sql<number>`coalesce(${referralsSq.paidReferrals}, 0)`.mapWith(Number),
      sales: sql<number>`coalesce(${invoicesSq.salesCount}, 0)`.mapWith(Number),
      commission: sql<number>`coalesce(${invoicesSq.totalComm}, 0)`.mapWith(
        Number
      ),

      // Rate: Clicks -> Signups
      clickToSignupRate: sql<number>`
        coalesce(round((${referralsSq.signups}::numeric / nullif(${clicksSq.clicks}, 0)::numeric) * 100, 2), 0)
      `.mapWith(Number),

      // Rate: Signups -> Paid (Conversion)
      signupToPaidRate: sql<number>`
        coalesce(round((${referralsSq.paidReferrals}::numeric / nullif(${referralsSq.signups}, 0)::numeric) * 100, 2), 0)
      `.mapWith(Number),

      fullUrl: sql<string>`
        'https://' || ${organization.websiteUrl} || '?' || ${organization.referralParam} || '=' || ${affiliateLink.id}
      `,
    })
    .from(affiliateLink)
    .innerJoin(organization, eq(organization.id, affiliateLink.organizationId))
    .leftJoin(clicksSq, eq(clicksSq.linkId, affiliateLink.id))
    .leftJoin(referralsSq, eq(referralsSq.linkId, affiliateLink.id))
    .leftJoin(invoicesSq, eq(invoicesSq.linkId, affiliateLink.id))
    .where(
      and(
        eq(affiliateLink.affiliateId, decoded.id),
        eq(affiliateLink.organizationId, decoded.orgId)
      )
    )
}
