"use server"

import {
  AuthCustomization,
  defaultAuthCustomization,
} from "@/customization/Auth/defaultAuthCustomization"
import {
  DashboardCustomization,
  defaultDashboardCustomization,
} from "@/customization/Dashboard/defaultDashboardCustomization"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { saveOrganizationCustomization } from "@/lib/organizationAction/saveOrganizationCustomization"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export async function saveTeamCustomizationsAction(
  orgId: string,
  data: {
    auth?: Partial<AuthCustomization>
    dashboard?: Partial<DashboardCustomization>
  }
): Promise<MutationData> {
  return handleAction("saveCustomizationsAction", async () => {
    await getTeamAuthAction(orgId)
    // Quick guard
    await saveOrganizationCustomization(orgId, data)
    return { ok: true, toast: "Customization Saved Successfully" }
  })
}
