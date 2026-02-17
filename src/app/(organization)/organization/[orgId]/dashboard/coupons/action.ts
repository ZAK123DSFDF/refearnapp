// actions/promotion-codes.ts
"use server"

import { handleAction } from "@/lib/handleAction"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { unlinkAffiliateService } from "@/lib/server/organization/unlinkAffiliateAction"
import { MutationData } from "@/lib/types/organization/response"
import { updatePromotionAssignmentService } from "@/lib/server/organization/updatePromotionAssignmentService"

export async function unlinkAffiliateAction(
  orgId: string,
  codeId: string
): Promise<MutationData> {
  return handleAction("unlinkAffiliateAction", async () => {
    await getOrgAuth(orgId)
    await unlinkAffiliateService({ orgId, codeId })
    return { ok: true, toast: "Affiliate unlinked successfully" }
  })
}
export async function updatePromotionAssignmentAction(
  orgId: string,
  codeId: string,
  data: any
): Promise<MutationData> {
  return handleAction("updatePromotionAssignmentAction", async () => {
    await getOrgAuth(orgId)
    await updatePromotionAssignmentService({
      orgId,
      codeId,
      data,
    })

    return {
      ok: true,
      toast: "Promotion settings updated successfully.",
    }
  })
}
