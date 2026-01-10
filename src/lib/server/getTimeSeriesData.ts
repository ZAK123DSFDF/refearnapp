"use server"
import { db } from "@/db/drizzle"
import { and, inArray, sql } from "drizzle-orm"
import { affiliateClick, affiliateInvoice } from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
export async function getTimeSeriesData<T>(
  linkIds: string[],
  year?: number,
  month?: number
) {
  const clickDay = sql<string>`(${affiliateClick.createdAt}::date)`
  const invoiceDay = sql<string>`(${affiliateInvoice.createdAt}::date)`

  const [clicksAgg, salesAgg] = await Promise.all([
    db
      .select({
        day: clickDay,
        visits: sql<number>`count(*)`.mapWith(Number),
      })
      .from(affiliateClick)
      .where(
        buildWhereWithDate(
          [inArray(affiliateClick.affiliateLinkId, linkIds)],
          affiliateClick,
          year,
          month,
          true
        )
      )
      .groupBy(clickDay),

    db
      .select({
        day: invoiceDay,
        subscriptionId: affiliateInvoice.subscriptionId,
        subs: sql<number>`count(distinct case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.subscriptionId} end)`.mapWith(
          Number
        ),
        singles:
          sql<number>`sum(case when ${affiliateInvoice.subscriptionId} is null and ${affiliateInvoice.refundedAt} is null then 1 else 0 end)`.mapWith(
            Number
          ), // null subs (one-off)
        commission:
          sql<number>`coalesce(sum(case when ${affiliateInvoice.refundedAt} is null then ${affiliateInvoice.commission} else 0 end), 0)`.mapWith(
            Number
          ),
      })
      .from(affiliateInvoice)
      .where(
        and(
          sql`${affiliateInvoice.refundedAt} IS NULL`,
          buildWhereWithDate(
            [inArray(affiliateInvoice.affiliateLinkId, linkIds)],
            affiliateInvoice,
            year,
            month,
            true
          )
        )
      )
      .groupBy(invoiceDay, affiliateInvoice.subscriptionId),
  ])

  // Merge by day (include days that exist in either aggregate)
  const byDay = new Map<
    string,
    { visits: number; sales: number; commission: number }
  >()

  for (const row of clicksAgg) {
    const d = row.day // already 'YYYY-MM-DD' via ::date
    const curr = byDay.get(d) ?? { visits: 0, sales: 0, commission: 0 }
    curr.visits += row.visits
    byDay.set(d, curr)
  }

  const seenSubs = new Set<string>()

  for (const row of salesAgg) {
    const d = row.day
    const curr = byDay.get(d) ?? { visits: 0, sales: 0, commission: 0 }

    if (row.subscriptionId === null) {
      // always count one-time sales
      curr.sales += 1
    } else {
      if (!seenSubs.has(row.subscriptionId)) {
        curr.sales += 1
        seenSubs.add(row.subscriptionId)
      }
    }
    byDay.set(d, curr)
  }

  return Array.from(byDay.entries())
    .filter(([_, v]) => v.visits > 0 || v.sales > 0)
    .map(([date, v]) => ({
      createdAt: date,
      visitors: v.visits,
      sales: v.sales,
      conversionRate:
        v.visits > 0
          ? Math.round((v.sales / v.visits) * 10000) / 100
          : v.sales > 0
            ? 100
            : 0,
    }))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)) as T[]
}
