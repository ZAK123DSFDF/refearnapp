// app/actions/auth/orgInfo.ts
"use server"
import { OrgData } from "@/lib/types/organization"
import { ActionResult, MutationData } from "@/lib/types/response"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { handleAction } from "@/lib/handleAction"
import { getOrgData } from "@/lib/server/getOrgData"
import { updateSettings } from "@/lib/organizationAction/UpdateSettings"
import { verifyOrgCNAME } from "@/lib/organizationAction/verifyOrgCNAME"
import { verifyOrgARECORD } from "@/lib/organizationAction/verifyOrgARECORD"

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
export async function verifyCNAME(domain: string): Promise<MutationData> {
  return handleAction("verifyCNAME", async () => {
    await verifyOrgCNAME(domain)

    return {
      ok: true,
      toast: "✅ CNAME record is correctly set.",
    }
  })
}

// ✅ Verify A record (for main domains)
export async function verifyARecord(domain: string): Promise<MutationData> {
  return handleAction("verifyARecord", async () => {
    await verifyOrgARECORD(domain)

    return {
      ok: true,
      toast: "✅ A record is correctly set.",
    }
  })
}
