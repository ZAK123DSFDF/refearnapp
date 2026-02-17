// src/app/api/organization/[orgId]/route.ts
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrg } from "@/lib/server/organization/getOrg"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { AppError } from "@/lib/exceptions"

// src/app/api/organization/[orgId]/route.ts
export const GET = handleRoute(
  "Get Organization",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)
    const context = (searchParams.get("context") || "public") as
      | "public"
      | "affiliate"
      | "admin"
      | "team"
    switch (context) {
      case "admin":
        await getOrgAuth(orgId)
        break
      case "team":
        await getTeamAuthAction(orgId)
        break
      case "affiliate":
        await getAffiliateOrganization(orgId)
        break
      case "public":
        break
      default:
        throw new AppError({
          status: 500,
          error: "Invalid context parameter",
          toast: "Invalid request context",
        })
    }
    const org = await getOrg(orgId, context)

    return NextResponse.json({ ok: true, data: org })
  }
)
