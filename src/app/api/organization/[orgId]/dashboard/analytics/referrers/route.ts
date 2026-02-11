import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getOrgAffiliateLinks } from "@/lib/server/affiliate/GetOrgAffiliateLinks"
import { getReferrerStats } from "@/lib/server/analytics/getReferrerStats"
import { handleRoute } from "@/lib/handleRoute"
export const GET = handleRoute(
  "Get Org Referrers",
  async (req, { orgId }: { orgId: string }) => {
    // 🔍 DEBUG LOG
    console.log(`🚀 ROUTE HIT: Get Org KPI for OrgID: ${orgId}`)
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined

    const org = await getOrgAuth(orgId)
    const { linkIds } = await getOrgAffiliateLinks(org, orgId)
    const referrerStats = await getReferrerStats(linkIds, year, month)

    return NextResponse.json({ ok: true, data: referrerStats })
  }
)
