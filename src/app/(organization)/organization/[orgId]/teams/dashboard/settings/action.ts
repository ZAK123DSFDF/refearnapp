"use server"
import { OrgData } from "@/lib/types/organization"
import { ActionResult, MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { getOrgData } from "@/lib/server/getOrgData"
import { updateSettings } from "@/lib/organizationAction/UpdateSettings"
import { verifyOrgCNAME } from "@/lib/organizationAction/verifyOrgCNAME"
import { verifyOrgARECORD } from "@/lib/organizationAction/verifyOrgARECORD"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export const orgTeamInfo = async (
  orgId: string
): Promise<ActionResult<OrgData>> => {
  return handleAction("org Team Info", async () => {
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
export async function verifyTeamCNAME(domain: string): Promise<MutationData> {
  return handleAction("verifyCNAME", async () => {
    await verifyOrgCNAME(domain)

    return {
      ok: true,
      toast: "✅ CNAME record is correctly set.",
    }
  })
}

// ✅ Verify A record (for main domains)
export async function verifyTeamARecord(domain: string): Promise<MutationData> {
  return handleAction("verifyARecord", async () => {
    await verifyOrgARECORD(domain)

    return {
      ok: true,
      toast: "✅ A record is correctly set.",
    }
  })
}
