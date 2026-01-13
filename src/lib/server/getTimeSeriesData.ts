"use server"
import { db } from "@/db/drizzle"
import { and, inArray, sql } from "drizzle-orm"
import { affiliateClick, affiliateInvoice } from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
export async function getTimeSeriesData<T>(
  linkIds: string[],
  year?: number,
  month?: number,
  isAffiliate: boolean = true // Add this flag
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
        value: sql<number>`
          coalesce(
            sum(
              case when ${affiliateInvoice.refundedAt} is null
          then ${isAffiliate ? affiliateInvoice.commission : affiliateInvoice.amount}
          else 0 end
          ), 0
          )`.mapWith(Number),
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

  const byDay = new Map<
    string,
    { visits: number; sales: number; value: number }
  >()

  // Process Clicks
  for (const row of clicksAgg) {
    const d = row.day
    const curr = byDay.get(d) ?? { visits: 0, sales: 0, value: 0 }
    curr.visits += row.visits
    byDay.set(d, curr)
  }

  const seenSubs = new Set<string>()

  // Process Sales
  for (const row of salesAgg) {
    const d = row.day
    const curr = byDay.get(d) ?? { visits: 0, sales: 0, value: 0 }

    // DYNAMIC LOGIC: Use revenue for Org/Team, Commission for Affiliates
    curr.value += row.value

    if (row.subscriptionId === null) {
      curr.sales += 1
    } else if (!seenSubs.has(row.subscriptionId)) {
      curr.sales += 1
      seenSubs.add(row.subscriptionId)
    }
    byDay.set(d, curr)
  }

  return Array.from(byDay.entries())
    .filter(([_, v]) => v.visits > 0 || v.sales > 0 || v.value > 0)
    .map(([date, v]) => {
      const visitors = v.visits || 0
      const sales = v.sales || 0

      let conversionRate = 0
      if (visitors > 0)
        conversionRate = Math.round((sales / visitors) * 10000) / 100
      else if (sales > 0) conversionRate = 100

      return {
        createdAt: date,
        visitors: visitors,
        sales: sales,
        amount: v.value,
        conversionRate: conversionRate,
      }
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)) as T[]
}
