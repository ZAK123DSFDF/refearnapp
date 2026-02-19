import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"
import { getAffiliateKpiStatsAction } from "@/lib/server/affiliate/getAffiliateKpiStats"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { ExchangeRate } from "@/util/ExchangeRate"
export const GET = handleRoute(
  "Get Affiliate KPI Stats",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined

    // 🔐 Affiliate Auth
    const decoded = await getAffiliateOrganization(orgId)

    const [row] = await getAffiliateKpiStatsAction(
      decoded.orgId,
      decoded.id,
      year,
      month
    )

    const org = await getOrganization(decoded.orgId)
    const rate = await ExchangeRate(org.currency)

    const data = {
      totalLinks: row?.totalLinks ?? 0,
      totalVisitors: row?.totalVisitors ?? 0,
      totalSignups: row?.totalSignups ?? 0,
      totalPaidReferrals: row?.totalPaidReferrals ?? 0,
      clickToSignupRate: row?.clickToSignupRate ?? 0,
      signupToPaidRate: row?.signupToPaidRate ?? 0,
      totalSales: row?.sales ?? 0,
      totalCommission: (row?.commission ?? 0) * rate,
      totalCommissionPaid: (row?.paid ?? 0) * rate,
      totalCommissionUnpaid: (row?.unpaid ?? 0) * rate,
      currency: org.currency,
    }
    return NextResponse.json({ ok: true, data: [data] })
  }
)
