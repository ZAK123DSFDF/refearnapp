import { db } from "@/db/drizzle"
import { promotionCodes, affiliate } from "@/db/schema"
import { PromotionCodeType } from "@/lib/types/organization/promotion"
import { and, desc, eq, ilike, sql, isNull } from "drizzle-orm"

export async function getPromotionCodesAction(
  orgId: string,
  opts?: {
    code?: string
    limit?: number
    offset?: number
    orderBy?: "code" | "createdAt" | "discountValue"
    orderDir?: "asc" | "desc"
  }
): Promise<PromotionCodeType[]> {
  const whereConditions = [
    eq(promotionCodes.organizationId, orgId),
    isNull(promotionCodes.deletedAt),
  ]

  // 2. Filter by code search
  if (opts?.code) {
    whereConditions.push(ilike(promotionCodes.code, `%${opts.code}%`))
  }

  const query = db
    .select({
      id: promotionCodes.id,
      code: promotionCodes.code,
      status: sql<
        "active" | "inactive"
      >`CASE WHEN ${promotionCodes.isActive} THEN 'active' ELSE 'inactive' END`,
      discountValue: promotionCodes.discountValue,
      discountType: promotionCodes.discountType,
      commissionValue: promotionCodes.commissionValue,
      commissionType: promotionCodes.commissionType,
      commissionDurationValue: promotionCodes.commissionDurationValue,
      commissionDurationUnit: promotionCodes.commissionDurationUnit,
      createdAt: promotionCodes.createdAt,
      affiliateName: affiliate.name,
      affiliateEmail: affiliate.email,
    })
    .from(promotionCodes)
    .leftJoin(affiliate, eq(promotionCodes.affiliateId, affiliate.id))
    .where(and(...whereConditions))

  // 3. Handle Ordering
  if (opts?.orderBy && opts.orderBy !== ("none" as any)) {
    const column = promotionCodes[opts.orderBy]
    query.orderBy(opts.orderDir === "asc" ? column : desc(column))
  } else {
    query.orderBy(desc(promotionCodes.createdAt))
  }

  // 4. Pagination
  if (opts?.limit) query.limit(opts.limit)
  if (opts?.offset) query.offset(opts.offset)

  return query
}
