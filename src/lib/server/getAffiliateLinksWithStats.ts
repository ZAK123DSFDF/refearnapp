"use server"
import {
  affiliate,
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
  organization,
} from "@/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
import { getDB } from "@/db/drizzle"
export async function getAffiliateLinksWithStatsAction(
  decoded: {
    id: string
    orgId: string
  },
  year?: number,
  month?: number
) {
  const db = await getDB()
  return db
    .select({
      id: affiliateLink.id,
      createdAt: affiliateLink.createdAt,
      clicks: sql<number>`count(distinct ${affiliateClick.id})`.mapWith(Number),
      sales: sql<number>`COUNT(DISTINCT CASE 
    WHEN ${affiliateInvoice.reason} IN ('subscription_create', 'one_time') 
    THEN ${affiliateInvoice.id} END
)`.mapWith(Number),

      conversionRate: sql<number>`CASE
  WHEN COUNT(DISTINCT ${affiliateClick.id}) = 0 THEN 0
  ELSE (
    COUNT(DISTINCT CASE 
      WHEN ${affiliateInvoice.reason} IN ('subscription_create', 'one_time') 
      THEN ${affiliateInvoice.id} END
    )::float
    / COUNT(DISTINCT ${affiliateClick.id})::float
  ) * 100
END`.mapWith(Number),
      fullUrl: sql<string>`
  COALESCE(
    MIN('https://' || ${organization.websiteUrl} || '?' || ${organization.referralParam} || '=' || ${affiliateLink.id}),
    ''
  )
`,
    })
    .from(affiliate)
    .innerJoin(
      affiliateLink,
      and(
        eq(affiliateLink.affiliateId, affiliate.id),
        eq(affiliateLink.organizationId, decoded.orgId)
      )
    )
    .leftJoin(
      affiliateClick,
      buildWhereWithDate(
        [eq(affiliateClick.affiliateLinkId, affiliateLink.id)],
        affiliateClick,
        year,
        month
      )
    )
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)],
        affiliateInvoice,
        year,
        month
      )
    )
    .leftJoin(organization, eq(organization.id, affiliateLink.organizationId))
    .where(
      and(
        eq(affiliate.organizationId, decoded.orgId),
        eq(affiliate.id, decoded.id)
      )
    )
    .groupBy(
      affiliateLink.id,
      organization.websiteUrl,
      organization.referralParam
    )
}
