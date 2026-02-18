// @/app/actions/affiliate/coupons.ts
"use server"

import { handleAction } from "@/lib/handleAction"
import { markCouponAsSeen } from "@/lib/server/affiliate/markCouponAsSeen"
import { MutationData } from "@/lib/types/organization/response"
import { revalidatePath } from "next/cache"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"

export async function markCouponAsSeenAction({
  orgId,
  couponId,
}: {
  orgId: string
  couponId: string
}): Promise<MutationData> {
  return handleAction("markCouponAsSeenAction", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    await markCouponAsSeen({ orgId, affiliateId: decoded.id, couponId })
    revalidatePath(`/affiliate/${orgId}/dashboard/coupons`)
    return { ok: true }
  })
}
