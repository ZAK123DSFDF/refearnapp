import { db } from "@/db/drizzle"
import { promotionCodes, affiliate } from "@/db/schema"
import { PromotionCodeType } from "@/lib/types/organization/promotion"
import { and, desc, asc, eq, ilike, sql, isNull } from "drizzle-orm"
import { CouponSortKeys } from "@/lib/types/organization/couponSortKeys"

export async function getPromotionCodesAction(
  orgId: string,
  opts?: {
    code?: string
    limit?: number
    offset?: number
    orderBy?: CouponSortKeys
    orderDir?: "asc" | "desc"
  }
): Promise<PromotionCodeType[]> {
  const whereConditions = [
    eq(promotionCodes.organizationId, orgId),
    isNull(promotionCodes.deletedAt),
  ]
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
  const direction = opts?.orderDir === "asc" ? asc : desc
  const orderArray: any[] = []
  const sortKey = opts?.orderBy
  if (sortKey && sortKey !== ("none" as any)) {
    if (sortKey === "name" || sortKey === "email") {
      orderArray.push(
        asc(
          sql`CASE WHEN ${promotionCodes.affiliateId} IS NULL THEN 1 ELSE 0 END`
        )
      )
      const col = sortKey === "name" ? affiliate.name : affiliate.email
      orderArray.push(direction(col))
    } else {
      let col
      switch (sortKey) {
        case "code":
          col = promotionCodes.code
          break
        case "createdAt":
          col = promotionCodes.createdAt
          break
        default:
          col = promotionCodes.createdAt
      }
      orderArray.push(direction(col))
    }
  } else {
    orderArray.push(desc(promotionCodes.createdAt))
  }
  query.orderBy(...orderArray)
  if (opts?.limit) query.limit(opts.limit)
  if (opts?.offset) query.offset(opts.offset)
  return query as unknown as Promise<PromotionCodeType[]>
}
