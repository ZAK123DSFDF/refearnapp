import { NextResponse } from "next/server"
import { getOrgAffiliateLinks } from "@/lib/server/affiliate/GetOrgAffiliateLinks"
import { getTimeSeriesData } from "@/lib/server/analytics/getTimeSeriesData"
import { ExchangeRate } from "@/util/ExchangeRate"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"

export const GET = handleRoute(
  "Get Team Time Series",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined

    const org = await getTeamAuthAction(orgId)
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
