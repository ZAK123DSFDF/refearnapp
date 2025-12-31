// app/actions/auth/orgInfo.ts
"use server"
import { OrgData } from "@/lib/types/organization"
import { ActionResult, MutationData } from "@/lib/types/response"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { handleAction } from "@/lib/handleAction"
import { getOrgData } from "@/lib/server/getOrgData"
import { updateSettings } from "@/lib/organizationAction/UpdateSettings"

export const orgInfo = async (
  orgId: string
): Promise<ActionResult<OrgData>> => {
  return handleAction("orgInfo", async () => {
    await getOrgAuth(orgId)
    return await getOrgData(orgId, false)
  })
}
export async function updateOrgSettings(
  data: Partial<OrgData> & { id: string }
): Promise<MutationData> {
  return handleAction("updateOrgSettings", async () => {
    await getOrgAuth(data.id)
    await updateSettings(data)
    return { ok: true, toast: "Successfully Updated Org Settings" }
  })
}
