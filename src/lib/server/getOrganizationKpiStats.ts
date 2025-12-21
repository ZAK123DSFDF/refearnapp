import { db } from "@/db/drizzle"
import { eq, sql } from "drizzle-orm"
import {
  affiliate,
  affiliateClick,
  affiliateInvoice,
  affiliateLink,
} from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getOrganizationKpiStatsAction(
  orgId: string,
  year?: number,
  month?: number
) {
  return db
    .select({
      totalAffiliates: sql<number>`COUNT(DISTINCT ${affiliate.id})`.mapWith(
        Number
      ),
      totalLinks: sql<number>`COUNT(DISTINCT ${affiliateLink.id})`.mapWith(
        Number
      ),

      totalVisitors: sql<number>`COUNT(DISTINCT ${affiliateClick.id})`.mapWith(
        Number
      ),
      sales: sql<number>`COUNT(DISTINCT CASE
        WHEN ${affiliateInvoice.reason} IN ('subscription_create', 'one_time') THEN ${affiliateInvoice.id}
      END)`.mapWith(Number),

      commission:
        sql<number>`COALESCE(SUM(${affiliateInvoice.commission}),0)`.mapWith(
          Number
        ),
      paid: sql<number>`COALESCE(SUM(${affiliateInvoice.paidAmount}),0)`.mapWith(
        Number
      ),
      unpaid:
        sql<number>`COALESCE(SUM(${affiliateInvoice.unpaidAmount}),0)`.mapWith(
          Number
        ),
      amount: sql<number>`COALESCE(SUM(${affiliateInvoice.amount}),0)`.mapWith(
        Number
      ),
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
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)],
        affiliateInvoice,
        year,
        month
      )
    )
    .where(eq(affiliate.organizationId, orgId))
}
