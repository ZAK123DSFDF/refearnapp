import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { db } from "@/db/drizzle"
import {
  organizationAuthCustomization,
  organizationDashboardCustomization,
} from "@/db/schema"
import { eq } from "drizzle-orm"
export const GET = handleRoute(
  "Get All Customizations",
  async (_, { orgId }: { orgId: string }) => {
    const [authRow, dashboardRow] = await Promise.all([
      db
        .select({ auth: organizationAuthCustomization.auth })
        .from(organizationAuthCustomization)
        .where(eq(organizationAuthCustomization.id, orgId))
        .then((res) => res[0]),
      db
        .select({ dashboard: organizationDashboardCustomization.dashboard })
        .from(organizationDashboardCustomization)
        .where(eq(organizationDashboardCustomization.id, orgId))
        .then((res) => res[0]),
    ])

    return NextResponse.json({
      ok: true,
      data: {
        auth: authRow?.auth ?? null,
        dashboard: dashboardRow?.dashboard ?? null,
      },
    })
  }
)
