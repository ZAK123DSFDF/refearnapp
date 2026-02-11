import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { db } from "@/db/drizzle"
import { organizationDashboardCustomization } from "@/db/schema"
import { eq } from "drizzle-orm"
export const GET = handleRoute(
  "Get Dashboard Customization",
  async (_, { orgId }: { orgId: string }) => {
    const [dashboardRow] = await db
      .select({ dashboard: organizationDashboardCustomization.dashboard })
      .from(organizationDashboardCustomization)
      .where(eq(organizationDashboardCustomization.id, orgId))

    return NextResponse.json({
      ok: true,
      data: dashboardRow?.dashboard ?? null,
    })
  }
)
