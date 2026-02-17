import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function updatePromotionAssignmentService({
  orgId,
  codeId,
  data,
}: {
  orgId: string
  codeId: string
  data: {
    affiliateId: string
    commissionType: "PERCENTAGE" | "FLAT_FEE"
    commissionValue: string
    durationValue: string
    durationUnit: "day" | "week" | "month" | "year"
  }
}) {
  await db
    .update(promotionCodes)
    .set({
      affiliateId: data.affiliateId,
      commissionType: data.commissionType,
      commissionValue: data.commissionValue,
      commissionDurationValue: parseInt(data.durationValue, 10),
      commissionDurationUnit: data.durationUnit,
      isSeenByAffiliate: false,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(promotionCodes.id, codeId),
        eq(promotionCodes.organizationId, orgId)
      )
    )
}
