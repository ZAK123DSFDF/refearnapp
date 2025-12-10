"use server"
import { affiliateClick, affiliateInvoice } from "@/db/schema"
import { inArray, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
import { getDB } from "@/db/drizzle"

export async function getClickInvoiceAggregate(
  linkIds: string[],
  year?: number,
  month?: number,
  months?: { month: number; year: number }[]
) {
  const db = await getDB()
  const [clickAgg, invoiceAgg] = await Promise.all([
    db
      .select({
        linkId: affiliateClick.affiliateLinkId,
        visits: sql<number>`count(*)`.mapWith(Number),
      })
      .from(affiliateClick)
      .where(
        buildWhereWithDate(
          [inArray(affiliateClick.affiliateLinkId, linkIds)],
          affiliateClick,
          year,
          month,
          false,
          months
        )
      )
      .groupBy(affiliateClick.affiliateLinkId),

    db
      .select({
        linkId: affiliateInvoice.affiliateLinkId,
        subs: sql<number>`count(distinct ${affiliateInvoice.subscriptionId})`.mapWith(
          Number
        ),
        singles:
          sql<number>`sum(case when ${affiliateInvoice.subscriptionId} is null then 1 else 0 end)`.mapWith(
            Number
          ),
        commission:
          sql<number>`coalesce(sum(${affiliateInvoice.commission}), 0)`.mapWith(
            Number
          ),
        paid: sql<number>`coalesce(sum(${affiliateInvoice.paidAmount}), 0)`.mapWith(
          Number
        ),
        unpaid:
          sql<number>`coalesce(sum(${affiliateInvoice.unpaidAmount}), 0)`.mapWith(
            Number
          ),
      })
      .from(affiliateInvoice)
      .where(
        buildWhereWithDate(
          [inArray(affiliateInvoice.affiliateLinkId, linkIds)],
          affiliateInvoice,
          year,
          month,
          false,
          months
        )
      )
      .groupBy(affiliateInvoice.affiliateLinkId),
  ])
  return { clickAgg, invoiceAgg }
}
