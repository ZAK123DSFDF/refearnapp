import { db } from "@/db/drizzle"
import { inArray, or, sql } from "drizzle-orm"
import { affiliateClick, affiliateInvoice, referrals } from "@/db/schema"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"

export async function getTimeSeriesData<T>(
  linkIds: string[],
  promoIds: string[],
  year?: number,
  month?: number,
  isAffiliate: boolean = true
) {
  const clickDay = sql<string>`(${affiliateClick.createdAt}::date)`
  const invoiceDay = sql<string>`(${affiliateInvoice.createdAt}::date)`
  const referralDay = sql<string>`(${referrals.createdAt}::date)`
  const attribution = or(
    linkIds.length > 0
      ? inArray(affiliateInvoice.affiliateLinkId, linkIds)
      : undefined,
    promoIds.length > 0
      ? inArray(affiliateInvoice.promotionCodeId, promoIds)
      : undefined
  )
  const [clicksAgg, salesAgg, referralsAgg] = await Promise.all([
    // 1. Clicks (Visitors)
    db
      .select({ day: clickDay, visits: sql<number>`count(*)`.mapWith(Number) })
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

    // 2. Invoices (Sales/Value)
    db
      .select({
        day: invoiceDay,
        subscriptionId: affiliateInvoice.subscriptionId,
        value:
          sql<number>`coalesce(sum(case when ${affiliateInvoice.refundedAt} is null then ${isAffiliate ? affiliateInvoice.commission : affiliateInvoice.amount} else 0 end), 0)`.mapWith(
            Number
          ),
      })
      .from(affiliateInvoice)
      .where(
        buildWhereWithDate(
          [attribution, sql`${affiliateInvoice.refundedAt} IS NULL`],
          affiliateInvoice,
          year,
          month,
          true
        )
      )
      .groupBy(invoiceDay, affiliateInvoice.subscriptionId),

    // 3. Referrals (Signups) - NEW
    db
      .select({
        day: referralDay,
        signups: sql<number>`count(*)`.mapWith(Number),
      })
      .from(referrals)
      .where(
        buildWhereWithDate(
          [inArray(referrals.affiliateLinkId, linkIds)],
          referrals,
          year,
          month,
          true
        )
      )
      .groupBy(referralDay),
  ])

  // Initialize Map with signups field
  const byDay = new Map<
    string,
    { visits: number; signups: number; sales: number; value: number }
  >()

  // Helper to get or init map entry
  const getEntry = (d: string) =>
    byDay.get(d) ?? { visits: 0, signups: 0, sales: 0, value: 0 }

  // Process Clicks
  for (const row of clicksAgg)
    byDay.set(row.day, { ...getEntry(row.day), visits: row.visits })

  // Process Signups (New)
  for (const row of referralsAgg)
    byDay.set(row.day, { ...getEntry(row.day), signups: row.signups })

  // Process Sales
  const seenSubs = new Set<string>()
  for (const row of salesAgg) {
    const curr = getEntry(row.day)
    curr.value += row.value
    if (row.subscriptionId === null || !seenSubs.has(row.subscriptionId)) {
      curr.sales += 1
      if (row.subscriptionId) seenSubs.add(row.subscriptionId)
    }
    byDay.set(row.day, curr)
  }

  return Array.from(byDay.entries())
    .map(([date, v]) => {
      const visitors = v.visits || 0
      const signups = v.signups || 0
      const sales = v.sales || 0

      // 1. Click to Signup Rate (Visitors -> Signups)
      const clickToSignupRate =
        visitors > 0 ? Math.round((signups / visitors) * 10000) / 100 : 0

      // 2. Signup to Paid Rate (Signups -> Sales)
      const signupToPaidRate =
        signups > 0 ? Math.round((sales / signups) * 10000) / 100 : 0

      return {
        createdAt: date,
        visitors,
        signups,
        sales,
        amount: v.value,
        clickToSignupRate,
        signupToPaidRate,
      }
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt)) as T[]
}
