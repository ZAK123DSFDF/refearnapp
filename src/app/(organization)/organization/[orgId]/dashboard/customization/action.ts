"use server"

import { db } from "@/db/drizzle"
import {
  organizationAuthCustomization,
  organizationDashboardCustomization,
} from "@/db/schema"

import { eq } from "drizzle-orm"
import {
  AuthCustomization,
  defaultAuthCustomization,
} from "@/customization/Auth/defaultAuthCustomization"
import {
  DashboardCustomization,
  defaultDashboardCustomization,
} from "@/customization/Dashboard/defaultDashboardCustomization"
import { deepMerge } from "@/util/DeepMerge"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { saveOrganizationCustomization } from "@/lib/organizationAction/saveOrganizationCustomization"

export async function saveCustomizationsAction(
  orgId: string,
  data: {
    auth?: Partial<AuthCustomization>
    dashboard?: Partial<DashboardCustomization>
  }
): Promise<MutationData> {
  return handleAction("saveCustomizationsAction", async () => {
    await getOrgAuth(orgId)
    // Quick guard
    await saveOrganizationCustomization(orgId, data)
    return { ok: true, toast: "Customization Saved Successfully" }
  })
}
export async function getAuthCustomization(
  orgId: string
): Promise<AuthCustomization> {
  const [authRow] = await db
    .select({ auth: organizationAuthCustomization.auth })
    .from(organizationAuthCustomization)
    .where(eq(organizationAuthCustomization.id, orgId))

  return authRow?.auth as AuthCustomization
}

export async function getDashboardCustomization(
  orgId: string
): Promise<DashboardCustomization> {
  const [dashboardRow] = await db
    .select({ dashboard: organizationDashboardCustomization.dashboard })
    .from(organizationDashboardCustomization)
    .where(eq(organizationDashboardCustomization.id, orgId))

  return dashboardRow?.dashboard as DashboardCustomization
}
export async function getCustomizations(
  orgId: string
): Promise<{ auth: AuthCustomization; dashboard: DashboardCustomization }> {
  const [auth, dashboard] = await Promise.all([
    getAuthCustomization(orgId),
    getDashboardCustomization(orgId),
  ])

  return { auth, dashboard }
}
