"use server"
import { OrgData } from "@/lib/types/organization"
import { ActionResult, MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { getOrgData } from "@/lib/server/getOrgData"
import { updateSettings } from "@/lib/organizationAction/UpdateSettings"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export const orgTeamInfo = async (
  orgId: string
): Promise<ActionResult<OrgData>> => {
  return handleAction("org Team Info", async () => {
    await getTeamAuthAction(orgId)
    return await getOrgData(orgId, true)
  })
}
export async function updateTeamOrgSettings(
  data: Partial<OrgData> & { id: string },
  isTeam: boolean = false
): Promise<MutationData> {
  return handleAction("updateOrgSettings", async () => {
    await getTeamAuthAction(data.id)
    await updateSettings(data, { team: isTeam })
    return { ok: true, toast: "Successfully Updated Org Settings" }
  })
}
