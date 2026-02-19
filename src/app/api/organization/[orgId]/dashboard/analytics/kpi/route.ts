import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getOrganizationKpiStatsAction } from "@/lib/server/internal/getOrganizationKpiStats"
import { ExchangeRate } from "@/util/ExchangeRate"
import { handleRoute } from "@/lib/handleRoute"

export const GET = handleRoute(
  "Get Org KPI",
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

    // Verification: Ensure user belongs to this organization
    const org = await getOrgAuth(orgId)

    const [row] = await getOrganizationKpiStatsAction(orgId, year, month)
    const rate = await ExchangeRate(org.currency)

    const data = {
      totalAffiliates: row?.totalAffiliates ?? 0,
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
      totalAmount: (row?.amount ?? 0) * rate,
      currency: org.currency,
    }
    console.log("data of organization", data)
    return NextResponse.json({ ok: true, data: [data] })
  }
)
