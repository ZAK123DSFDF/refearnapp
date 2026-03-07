import { db } from "@/db/drizzle"
import { and, eq, sql, or } from "drizzle-orm"
import { affiliateInvoice, affiliateLink, promotionCodes } from "@/db/schema"

export async function getUnpaidPayoutAction(orgId: string) {
  // 1. Create the CTE to resolve the organizationId for every invoice
  const resolvedInvoices = db.$with("resolved_invoices").as(
    db
      .select({
        createdAt: affiliateInvoice.createdAt,
        unpaidAmount: affiliateInvoice.unpaidAmount,
        // Resolve orgId: prefer link, fallback to promo
        orgId:
          sql<string>`COALESCE(${affiliateLink.organizationId}, ${promotionCodes.organizationId})`.as(
            "org_id"
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
      .where(sql`${affiliateInvoice.unpaidAmount} > 0`)
  )

  // 2. Perform the final aggregation on the resolved set
  return db
    .with(resolvedInvoices)
    .select({
      month:
        sql<number>`extract(month from ${resolvedInvoices.createdAt})`.mapWith(
          Number
        ),
      year: sql<number>`extract(year from ${resolvedInvoices.createdAt})`.mapWith(
        Number
      ),
      unpaid: sql<number>`sum(${resolvedInvoices.unpaidAmount})`.mapWith(
        Number
      ),
    })
    .from(resolvedInvoices)
    .where(eq(resolvedInvoices.orgId, orgId))
    .groupBy(
      sql`EXTRACT(YEAR FROM ${resolvedInvoices.createdAt})`,
      sql`EXTRACT(MONTH FROM ${resolvedInvoices.createdAt})`
    )
}
