import { NextResponse } from "next/server"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { getOrgAffiliateLinks } from "@/lib/server/affiliate/GetOrgAffiliateLinks"
import { getReferrerStats } from "@/lib/server/analytics/getReferrerStats"
import { handleRoute } from "@/lib/handleRoute"

export const GET = handleRoute(
  "Get Team Referrers",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined

    const org = await getTeamAuthAction(orgId)
    const { linkIds } = await getOrgAffiliateLinks(org, orgId)
    const referrerStats = await getReferrerStats(linkIds, year, month)

    return NextResponse.json({ ok: true, data: referrerStats })
  }
)
