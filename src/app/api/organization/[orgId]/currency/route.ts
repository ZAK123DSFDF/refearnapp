import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"

export const GET = handleRoute(
  "Get Org Currency",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)
    const context = searchParams.get("context")
    if (context === "team") {
      await getTeamAuthAction(orgId)
    } else if (context === "affiliate") {
      await getAffiliateOrganization(orgId)
    } else {
      await getOrgAuth(orgId)
    }
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, orgId),
      columns: {
        currency: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: org?.currency ?? "USD",
    })
  }
)
