// lib/services/promotion-codes.ts
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { eq, and } from "drizzle-orm"

export async function unlinkAffiliateService({
  orgId,
  codeId,
}: {
  orgId: string
  codeId: string
}) {
  await db
    .update(promotionCodes)
    .set({
      affiliateId: null,
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
