import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { getDomainsAction } from "@/lib/server/internal/getDomainsAction"

export const GET = handleRoute(
  "Get Team Organization Domains",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    // 1. Extract Query Parameters
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const domain = searchParams.get("domain") || undefined

    // 2. 🔐 Team Authorization
    await getTeamAuthAction(orgId)

    // 3. Fetch Data using the shared internal utility
    const result = await getDomainsAction(orgId, offset, domain)

    return NextResponse.json({
      ok: true,
      data: result,
    })
  }
)
