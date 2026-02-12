import { NextResponse } from "next/server"
import { getOrganizationKpiStatsAction } from "@/lib/server/internal/getOrganizationKpiStats"
import { ExchangeRate } from "@/util/ExchangeRate"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
export const GET = handleRoute(
  "Get Team KPI",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined
    const org = await getTeamAuthAction(orgId)

    const [row] = await getOrganizationKpiStatsAction(orgId, year, month)
    const rate = await ExchangeRate(org.currency)

    const data = {
      totalAffiliates: row?.totalAffiliates ?? 0,
      totalLinks: row?.totalLinks ?? 0,
      totalVisitors: row?.totalVisitors ?? 0,
      totalSales: row?.sales ?? 0,
      totalCommission: (row?.commission ?? 0) * rate,
      totalCommissionPaid: (row?.paid ?? 0) * rate,
      totalCommissionUnpaid: (row?.unpaid ?? 0) * rate,
      totalAmount: (row?.amount ?? 0) * rate,
      currency: org.currency,
    }

    return NextResponse.json({ ok: true, data: [data] })
  }
)
