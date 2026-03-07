import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"
import { getOrgCurrencyAffiliate } from "@/lib/server/internal/getOrgCurrencyAffiliate"
import { getAffiliateLinks } from "@/lib/server/affiliate/getAffiliateLinks"
import { getTimeSeriesData } from "@/lib/server/analytics/getTimeSeriesData"
import { ExchangeRate } from "@/util/ExchangeRate"
export const GET = handleRoute(
  "Get Affiliate Time Series",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined

    const decoded = await getAffiliateOrganization(orgId)
    const currency = await getOrgCurrencyAffiliate(orgId)
    const rate = await ExchangeRate(currency)

    const { linkIds, promoIds } = await getAffiliateLinks(decoded)
    if (!linkIds.length) return NextResponse.json({ ok: true, data: [] })

    const rawData = await getTimeSeriesData(
      linkIds,
      promoIds,
      year,
      month,
      true
    )
    const data = rawData.map((item: any) => ({
      ...item,
      amount: item.amount * rate,
    }))

    return NextResponse.json({ ok: true, data })
  }
)
