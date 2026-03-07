import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getOrgAffiliateLinks } from "@/lib/server/affiliate/GetOrgAffiliateLinks"
import { getTimeSeriesData } from "@/lib/server/analytics/getTimeSeriesData"
import { ExchangeRate } from "@/util/ExchangeRate"
import { handleRoute } from "@/lib/handleRoute"

export const GET = handleRoute(
  "Get Org Time Series",
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
    const rate = await ExchangeRate(org.currency)
    const { linkIds, promoIds } = await getOrgAffiliateLinks(org, orgId)

    if (!linkIds.length) return NextResponse.json({ ok: true, data: [] })

    const data = await getTimeSeriesData(linkIds, promoIds, year, month, false)

    const formattedData = data.map((item: any) => ({
      ...item,
      amount: item.amount * rate,
    }))

    return NextResponse.json({ ok: true, data: formattedData })
  }
)
