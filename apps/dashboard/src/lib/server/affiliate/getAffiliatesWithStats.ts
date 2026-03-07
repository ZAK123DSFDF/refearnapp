import { db } from "@/db/drizzle"
import {
  affiliate,
  affiliateLink,
  affiliateClick,
  affiliateInvoice,
  organization,
  affiliatePayoutMethod,
  referrals,
  promotionCodes,
} from "@/db/schema"
import { and, desc, eq, ilike, isNull, or, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
import { AffiliateStatsField } from "@/util/AffiliateStatFields"
import {
  buildAffiliateStatsSelect,
  ExcludableFields,
} from "@/util/BuildAffiliateStatsSelect"
import { PayoutSortKeys } from "@/lib/types/organization/PayoutSortKeys"

type OrderableFields = PayoutSortKeys
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
  // 1. Isolated Click & Link Aggregation
  const clickSq = db
    .select({
      affiliateId: affiliate.id,
      clicks: sql`count(distinct ${affiliateClick.id})`.as("clicks"),
      links: sql`
        ARRAY_AGG(
          DISTINCT ('https://' || ${organization.websiteUrl} || '?' || ${organization.referralParam} || '=' || ${affiliateLink.id})
        )
      `.as("links"),
    })
    .from(affiliate)
    .leftJoin(organization, eq(organization.id, orgId))
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
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
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id, organization.websiteUrl, organization.referralParam)
    .as("click_sq")

  // 2. NEW: Isolated Signups (Referrals) Aggregation
  const referralSq = db
    .select({
      affiliateId: affiliate.id,
      signupCount: sql`count(distinct ${referrals.id})`.as("signup_count"),
    })
    .from(affiliate)
    .leftJoin(
      referrals,
      buildWhereWithDate(
        [eq(referrals.affiliateId, affiliate.id)],
        referrals,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("ref_sq")
  const attributionSq = db
    .select({
      affiliateId: affiliate.id,
      linkId: affiliateLink.id,
      promoId: promotionCodes.id,
    })
    .from(affiliate)
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
    .leftJoin(promotionCodes, eq(promotionCodes.affiliateId, affiliate.id))
    .as("attr_sq")
  // 2. Isolated Sales & Commission Aggregation
  // 2. Isolated Sales & Commission Aggregation
  const salesSqBase = db
    .select({
      affiliateId: attributionSq.affiliateId,
      salesCount: sql<number>`count(distinct ${affiliateInvoice.id})`.as(
        "sales_count"
      ),
      totalComm: sql<number>`sum(${affiliateInvoice.commission})`.as(
        "total_comm"
      ),
    })
    .from(attributionSq)
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [
          or(
            eq(affiliateInvoice.affiliateLinkId, attributionSq.linkId),
            eq(affiliateInvoice.promotionCodeId, attributionSq.promoId)
          ),
          isNull(affiliateInvoice.refundedAt),
          sql`${affiliateInvoice.reason} in ('subscription_create', 'one_time')`,
        ],
        affiliateInvoice,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(attributionSq.affiliateId, orgId))
    .groupBy(attributionSq.affiliateId)
    .as("sales_sq")

  // 3. Isolated PAID Amount Aggregation
  const paidSq = db
    .select({
      affiliateId: affiliate.id,
      amount: sql`sum(${affiliateInvoice.paidAmount})`.as("paid_amount"),
    })
    .from(affiliate)
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [
          eq(affiliateInvoice.affiliateLinkId, affiliateLink.id),
          isNull(affiliateInvoice.refundedAt),
          sql`${affiliateInvoice.paidAmount} > 0`,
        ],
        affiliateInvoice,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("paid_sq")

  // 4. Isolated UNPAID Amount Aggregation
  const unpaidSq = db
    .select({
      affiliateId: affiliate.id,
      amount: sql`sum(${affiliateInvoice.unpaidAmount})`.as("unpaid_amount"),
    })
    .from(affiliate)
    .leftJoin(affiliateLink, eq(affiliateLink.affiliateId, affiliate.id))
    .leftJoin(
      affiliateInvoice,
      buildWhereWithDate(
        [
          eq(affiliateInvoice.affiliateLinkId, affiliateLink.id),
          isNull(affiliateInvoice.refundedAt),
          sql`${affiliateInvoice.unpaidAmount} > 0`,
        ],
        affiliateInvoice,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("unpaid_sq")

  // 5. Final select fragments
  const visitsSql = sql<number>`coalesce(${clickSq.clicks}, 0)`.mapWith(Number)
  const signupsSql =
    sql<number>`coalesce(${referralSq.signupCount}, 0)`.mapWith(Number)
  const salesCountSql =
    sql<number>`coalesce(${salesSqBase.salesCount}, 0)`.mapWith(Number)
  const commissionSql =
    sql<number>`coalesce(${salesSqBase.totalComm}, 0)`.mapWith(Number)
  const paidAmountSql = sql<number>`coalesce(${paidSq.amount}, 0)`.mapWith(
    Number
  )
  const unpaidAmountSql = sql<number>`coalesce(${unpaidSq.amount}, 0)`.mapWith(
    Number
  )
  const linksSql = sql<string[]>`${clickSq.links}`

  const baseFields = buildAffiliateStatsSelect({
    ...opts,
    exclude: [
      ...(opts?.exclude ?? []),
      "visitors",
      "sales",
      "commission",
      "paid",
      "unpaid",
      "clickToSignupRate",
      "signupToPaidRate",
      "signups",
      "links",
    ] as ExcludableFields[],
  })
  const selectedFields = {
    ...baseFields,
    visitors: visitsSql,
    signups: signupsSql,
    sales: salesCountSql,
    commission: commissionSql,
    paid: paidAmountSql,
    unpaid: unpaidAmountSql,
    links: linksSql,
    currency: organization.currency,
    paypalEmail: affiliatePayoutMethod.accountIdentifier,
    clickToSignupRate: sql<number>`
      coalesce((${signupsSql})::float / nullif((${visitsSql}), 0)::float * 100, 0)
    `.mapWith(Number),
    signupToPaidRate: sql<number>`
      coalesce((${salesCountSql})::float / nullif((${signupsSql}), 0)::float * 100, 0)
    `.mapWith(Number),
  }

  // 6. Sorting Logic
  const orderExpr = (() => {
    if (!opts?.orderBy) return undefined
    const orderByMap: Record<string, any> = {
      visits: visitsSql,
      sales: salesCountSql,
      commission: commissionSql,
      commissionPaid: paidAmountSql,
      commissionUnpaid: unpaidAmountSql,
      email: affiliate.email,
      clickToSignupRate: sql`(${signupsSql})::float / nullif((${visitsSql}), 0)`,
      signupToPaidRate: sql`(${salesCountSql})::float / nullif((${signupsSql}), 0)`,
    }
    const base = orderByMap[opts.orderBy] ?? affiliate.email
    return opts.orderDir === "asc" ? base : desc(base)
  })()

  // 7. Execution
  const whereConditions = [eq(affiliate.organizationId, orgId)]
  if (opts?.email) {
    whereConditions.push(ilike(affiliate.email, `%${opts.email}%`))
  }

  const chained = db
    .select(selectedFields)
    .from(affiliate)
    .leftJoin(clickSq, eq(clickSq.affiliateId, affiliate.id))
    .leftJoin(referralSq, eq(referralSq.affiliateId, affiliate.id))
    .leftJoin(salesSqBase, eq(salesSqBase.affiliateId, affiliate.id))
    .leftJoin(paidSq, eq(paidSq.affiliateId, affiliate.id))
    .leftJoin(unpaidSq, eq(unpaidSq.affiliateId, affiliate.id))
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
    .orderBy(...(orderExpr ? [orderExpr] : []), affiliate.id)

  return applyOptionalLimitAndOffset(chained, opts?.limit, opts?.offset)
}
