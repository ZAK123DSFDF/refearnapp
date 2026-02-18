// @/lib/server/affiliate/getAffiliateCouponsAction.ts
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { and, desc, eq, isNull } from "drizzle-orm"

export async function getAffiliateCouponsAction(
  orgId: string,
  affiliateId: string,
  opts: { limit: number; offset: number }
) {
  return db
    .select({
      id: promotionCodes.id,
      code: promotionCodes.code,
      discountValue: promotionCodes.discountValue,
      discountType: promotionCodes.discountType,
      commissionValue: promotionCodes.commissionValue,
      commissionType: promotionCodes.commissionType,
      durationValue: promotionCodes.commissionDurationValue,
      durationUnit: promotionCodes.commissionDurationUnit,
      isSeenByAffiliate: promotionCodes.isSeenByAffiliate,
      createdAt: promotionCodes.createdAt,
    })
    .from(promotionCodes)
    .where(
      and(
        eq(promotionCodes.organizationId, orgId),
        eq(promotionCodes.affiliateId, affiliateId),
        eq(promotionCodes.isActive, true),
        isNull(promotionCodes.deletedAt)
      )
    )
    .orderBy(desc(promotionCodes.createdAt))
    .limit(opts.limit)
    .offset(opts.offset)
}
