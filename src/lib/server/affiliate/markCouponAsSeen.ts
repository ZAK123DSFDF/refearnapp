// @/lib/server/affiliate/markCouponAsSeen.ts
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function markCouponAsSeen({
  orgId,
  affiliateId,
  couponId,
}: {
  orgId: string
  affiliateId: string
  couponId: string
}): Promise<void> {
  await db
    .update(promotionCodes)
    .set({ isSeenByAffiliate: true })
    .where(
      and(
        eq(promotionCodes.id, couponId),
        eq(promotionCodes.affiliateId, affiliateId),
        eq(promotionCodes.organizationId, orgId)
      )
    )
}
