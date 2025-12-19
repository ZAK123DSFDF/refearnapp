import { db } from "@/db/drizzle"
import {
  organizationAuthCustomization,
  organizationDashboardCustomization,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { deepMerge } from "@/util/DeepMerge"
import {
  AuthCustomization,
  defaultAuthCustomization,
} from "@/customization/Auth/defaultAuthCustomization"
import {
  DashboardCustomization,
  defaultDashboardCustomization,
} from "@/customization/Dashboard/defaultDashboardCustomization"

export async function saveOrganizationCustomization(
  orgId: string,
  data: {
    auth?: Partial<AuthCustomization>
    dashboard?: Partial<DashboardCustomization>
  }
) {
  if (
    (!data.auth || Object.keys(data.auth).length === 0) &&
    (!data.dashboard || Object.keys(data.dashboard).length === 0)
  ) {
    throw { status: 400, toast: "No customization data provided" }
  }

  // ---- AUTH ----
  if (data.auth && Object.keys(data.auth).length > 0) {
    // fetch existing auth row (if any)
    const rows = await db
      .select({ auth: organizationAuthCustomization.auth })
      .from(organizationAuthCustomization)
      .where(eq(organizationAuthCustomization.id, orgId))

    if (rows.length === 0) {
      // create full object by merging defaults + patch, then insert
      const authToInsert = deepMerge(defaultAuthCustomization, data.auth)
      await db.insert(organizationAuthCustomization).values({
        id: orgId,
        auth: authToInsert,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      const existingAuth = rows[0].auth as AuthCustomization
      const merged = deepMerge(existingAuth, data.auth)
      await db
        .update(organizationAuthCustomization)
        .set({ auth: merged, updatedAt: new Date() })
        .where(eq(organizationAuthCustomization.id, orgId))
    }
  }

  // ---- DASHBOARD ----
  if (data.dashboard && Object.keys(data.dashboard).length > 0) {
    const rows = await db
      .select({ dashboard: organizationDashboardCustomization.dashboard })
      .from(organizationDashboardCustomization)
      .where(eq(organizationDashboardCustomization.id, orgId))

    if (rows.length === 0) {
      const dashboardToInsert = deepMerge(
        defaultDashboardCustomization,
        data.dashboard
      )
      await db.insert(organizationDashboardCustomization).values({
        id: orgId,
        dashboard: dashboardToInsert,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    } else {
      const existingDashboard = rows[0].dashboard as DashboardCustomization
      const merged = deepMerge(existingDashboard, data.dashboard)
      await db
        .update(organizationDashboardCustomization)
        .set({ dashboard: merged, updatedAt: new Date() })
        .where(eq(organizationDashboardCustomization.id, orgId))
    }
  }
}
