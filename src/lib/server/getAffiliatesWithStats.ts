"use server"
import {
  affiliate,
  affiliateLink,
  affiliateClick,
  affiliateInvoice,
  organization,
  affiliatePayoutMethod,
} from "@/db/schema"
import { and, desc, eq, ilike, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
import { AffiliateStatsField } from "@/util/AffiliateStatFields"
import {
  buildAffiliateStatsSelect,
  ExcludableFields,
} from "@/util/BuildAffiliateStatsSelect"
import { getDB } from "@/db/drizzle"

type OrderableFields =
  | "conversionRate"
  | "commission"
  | "sales"
  | "visits"
  | "email"
  | "commissionPaid"
  | "commissionUnpaid"
function applyOptionalLimitAndOffset<
  T extends { limit: (n: number) => any; offset: (n: number) => any },
>(q: T, limit?: number, offset?: number) {
  let query = q
  if (typeof limit === "number") {
    query = query.limit(limit)
  }
  if (typeof offset === "number") {
    query = query.offset(offset)
  }
  return query
}
export async function getAffiliatesWithStatsAction(
  orgId: string,
  year?: number,
  month?: number,
  months?: { month: number; year: number }[],
  opts?: {
    include?: AffiliateStatsField[]
    exclude?: ExcludableFields[]
    orderBy?: OrderableFields
    orderDir?: "asc" | "desc"
    limit?: number
    offset?: number
    email?: string
  }
) {
  const selectedFields = buildAffiliateStatsSelect(opts)
  const whereConditions = [eq(affiliate.organizationId, orgId)]
  if (opts?.email) {
    whereConditions.push(ilike(affiliate.email, `%${opts.email}%`))
  }
  const orderExpr = (() => {
    if (!opts?.orderBy) return undefined
    const conversionRateSql = sql`
      CASE
        WHEN COUNT(DISTINCT ${affiliateClick.id}) = 0 THEN 0
        ELSE (
          (
            COUNT(DISTINCT ${affiliateInvoice.subscriptionId})
            + COUNT(DISTINCT CASE 
                WHEN ${affiliateInvoice.subscriptionId} IS NULL 
                THEN ${affiliateInvoice.id} END
              )
          )::float / COUNT(DISTINCT ${affiliateClick.id})::float
        ) * 100
      END
    `
    const commissionSql = sql`COALESCE(SUM(${affiliateInvoice.commission}), 0)`
    const salesSql = sql`
      COUNT(DISTINCT ${affiliateInvoice.subscriptionId})
      + COUNT(DISTINCT CASE 
          WHEN ${affiliateInvoice.subscriptionId} IS NULL 
          THEN ${affiliateInvoice.id} END
        )
    `
    const visitsSql = sql`COUNT(DISTINCT ${affiliateClick.id})`
    const commissionPaidSql = sql`COALESCE(SUM(${affiliateInvoice.paidAmount}), 0)`
    const commissionUnpaidSql = sql`COALESCE(SUM(${affiliateInvoice.unpaidAmount}), 0)`
    const emailSql = affiliate.email
    const orderByMap: Record<string, any> = {
      conversionRate: conversionRateSql,
      commission: commissionSql,
      sales: salesSql,
      visits: visitsSql,
      commissionPaid: commissionPaidSql,
      commissionUnpaid: commissionUnpaidSql,
    }

    const base = orderByMap[opts.orderBy] ?? emailSql
    return opts.orderDir === "asc" ? base : desc(base)
  })()
  const db = await getDB()
  const chained = db
    .select(selectedFields)
    .from(affiliate)
    .leftJoin(
      affiliateLink,
      and(
        eq(affiliateLink.affiliateId, affiliate.id),
        eq(affiliateLink.organizationId, orgId)
      )
    )
    .leftJoin(
      affiliateClick,
      buildWhereWithDate(
        [eq(affiliateClick.affiliateLinkId, affiliateLink.id)],
        affiliateClick,
        year,
        month,
        false,
        months
      )
    )
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [eq(affiliateInvoice.affiliateLinkId, affiliateLink.id)],
        affiliateInvoice,
        year,
        month,
        false,
        months
      )
    )
    .leftJoin(organization, eq(organization.id, orgId))
    .leftJoin(
      affiliatePayoutMethod,
      and(
        eq(affiliatePayoutMethod.affiliateId, affiliate.id),
        eq(affiliatePayoutMethod.provider, "paypal"),
        eq(affiliatePayoutMethod.isDefault, true)
      )
    )
    .where(and(...whereConditions))
    .groupBy(affiliate.id, affiliate.email)
    .orderBy(...(orderExpr ? [orderExpr] : []))
  return applyOptionalLimitAndOffset(chained, opts?.limit, opts?.offset)
}
