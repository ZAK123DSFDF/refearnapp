// @/lib/server/affiliate/getUnseenCouponsCount.ts
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { and, eq, isNull, count } from "drizzle-orm"

export async function getUnseenCouponsCount(
  orgId: string,
  affiliateId: string
) {
  const result = await db
    .select({ value: count() })
    .from(promotionCodes)
    .where(
      and(
        eq(promotionCodes.organizationId, orgId),
        eq(promotionCodes.affiliateId, affiliateId),
        eq(promotionCodes.isSeenByAffiliate, false),
        eq(promotionCodes.isActive, true),
        isNull(promotionCodes.deletedAt)
      )
    )

  return result[0]?.value ?? 0
}
