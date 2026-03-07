import { db } from "@/db/drizzle"
import {
  affiliate,
  affiliateLink,
  affiliateClick,
  affiliateInvoice,
  organization,
  affiliatePayoutMethod,
  referrals,
  promotionCodes, // Added import
} from "@/db/schema"
import { and, desc, eq, ilike, isNull, sql } from "drizzle-orm"
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
  // 1. Clicks & Links (This part was mostly fine, but we'll keep it isolated)
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

  // 2. Signups
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

  /** * NEW STEP: The "Invoice Owner" Mapping
   * This identifies exactly which affiliate owns which invoice.
   * It prevents the "Fan-out" multiplication error.
   */
  const invoiceOwnerSq = db
    .select({
      invoiceId: affiliateInvoice.id,
      ownerAffiliateId:
        sql`COALESCE(${affiliateLink.affiliateId}, ${promotionCodes.affiliateId})`.as(
          "owner_id"
        ),
      commission: affiliateInvoice.commission,
      paidAmount: affiliateInvoice.paidAmount,
      unpaidAmount: affiliateInvoice.unpaidAmount,
      refundedAt: affiliateInvoice.refundedAt,
      reason: affiliateInvoice.reason,
      createdAt: affiliateInvoice.createdAt, // Needed for date filtering
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
    .as("inv_owner")

  // 3. Sales & Commission Aggregation (Using the mapping above)
  const salesSqBase = db
    .select({
      affiliateId: affiliate.id,
      salesCount: sql<number>`count(distinct ${invoiceOwnerSq.invoiceId})`.as(
        "sales_count"
      ),
      totalComm: sql<number>`sum(${invoiceOwnerSq.commission})`.as(
        "total_comm"
      ),
    })
    .from(affiliate)
    .leftJoin(
      invoiceOwnerSq,
      buildWhereWithDate(
        [
          eq(invoiceOwnerSq.ownerAffiliateId, affiliate.id),
          isNull(invoiceOwnerSq.refundedAt),
          sql`${invoiceOwnerSq.reason} in ('subscription_create', 'one_time')`,
        ],
        invoiceOwnerSq,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("sales_sq")

  // 4. Isolated PAID Amount Aggregation
  const paidSq = db
    .select({
      affiliateId: affiliate.id,
      amount: sql`sum(${invoiceOwnerSq.paidAmount})`.as("paid_amount"),
    })
    .from(affiliate)
    .leftJoin(
      invoiceOwnerSq,
      buildWhereWithDate(
        [
          eq(invoiceOwnerSq.ownerAffiliateId, affiliate.id),
          isNull(invoiceOwnerSq.refundedAt),
          sql`${invoiceOwnerSq.paidAmount} > 0`,
        ],
        invoiceOwnerSq,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("paid_sq")

  // 5. Isolated UNPAID Amount Aggregation
  const unpaidSq = db
    .select({
      affiliateId: affiliate.id,
      amount: sql`sum(${invoiceOwnerSq.unpaidAmount})`.as("unpaid_amount"),
    })
    .from(affiliate)
    .leftJoin(
      invoiceOwnerSq,
      buildWhereWithDate(
        [
          eq(invoiceOwnerSq.ownerAffiliateId, affiliate.id), // Move join condition here
          isNull(invoiceOwnerSq.refundedAt),
          sql`${invoiceOwnerSq.unpaidAmount} > 0`,
        ],
        invoiceOwnerSq,
        year,
        month,
        false,
        months
      )
    )
    .where(eq(affiliate.organizationId, orgId))
    .groupBy(affiliate.id)
    .as("unpaid_sq")

  // --- REST OF YOUR CODE (Final select and execution) IS CORRECT ---

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
    clickToSignupRate:
      sql<number>`coalesce((${signupsSql})::float / nullif((${visitsSql}), 0)::float * 100, 0)`.mapWith(
        Number
      ),
    signupToPaidRate:
      sql<number>`coalesce((${salesCountSql})::float / nullif((${signupsSql}), 0)::float * 100, 0)`.mapWith(
        Number
      ),
  }

  const orderExpr = (() => {
    if (!opts?.orderBy) return undefined
    const orderByMap: Record<string, any> = {
      visits: visitsSql,
      sales: salesCountSql,
      commission: commissionSql,
      commissionPaid: paidAmountSql,
      commissionUnpaid: unpaidAmountSql,
      email: affiliate.email,
    }
    const base = orderByMap[opts.orderBy] ?? affiliate.email
    return opts.orderDir === "asc" ? base : desc(base)
  })()

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
