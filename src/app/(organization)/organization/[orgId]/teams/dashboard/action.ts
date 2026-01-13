"use server"
import { ActionResult } from "@/lib/types/response"
import { OrganizationKpiStats } from "@/lib/types/affiliateKpiStats"
import { OrganizationKpiTimeSeries } from "@/lib/types/affiliateChartStats"
import { OrganizationReferrerStat } from "@/lib/types/affiliateReferrerStat"
import { handleAction } from "@/lib/handleAction"
import { getOrganizationKpiStatsAction } from "@/lib/server/getOrganizationKpiStats"
import { ExchangeRate } from "@/util/ExchangeRate"
import { getOrgAffiliateLinks } from "@/lib/server/GetOrgAffiliateLinks"
import { getTimeSeriesData } from "@/lib/server/getTimeSeriesData"
import { getReferrerStats } from "@/lib/server/getReferrerStats"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export async function getTeamOrganizationKpiStats(
  orgId: string,
  year?: number,
  month?: number
): Promise<ActionResult<OrganizationKpiStats[]>> {
  return handleAction("fetching Organization KPI Stats", async () => {
    const org = await getTeamAuthAction(orgId)
    const [row] = await getOrganizationKpiStatsAction(orgId, year, month)
    const rate = await ExchangeRate(org.currency)
    const OrganizationKpiStats: OrganizationKpiStats = {
      totalAffiliates: row?.totalAffiliates ?? 0,
      totalLinks: row?.totalLinks ?? 0,
      totalVisitors: row?.totalVisitors ?? 0,
      totalSales: row.sales ?? 0,
      totalCommission: (row?.commission ?? 0) * rate,
      totalCommissionPaid: (row?.paid ?? 0) * rate,
      totalCommissionUnpaid: (row?.unpaid ?? 0) * rate,
      totalAmount: (row?.amount ?? 0) * rate,
      currency: org.currency,
    }
    return { ok: true, data: [OrganizationKpiStats] }
  })
}
export async function getTeamOrganizationKpiTimeSeries(
  orgId: string,
  year?: number,
  month?: number
): Promise<ActionResult<OrganizationKpiTimeSeries[]>> {
  return handleAction("fetching Organization KPI Time Series", async () => {
    const org = await getTeamAuthAction(orgId)
    const rate = await ExchangeRate(org.currency)
    const { linkIds } = await getOrgAffiliateLinks(org, orgId)
    if (!linkIds.length) return { ok: true, data: [] }
    const data = await getTimeSeriesData<OrganizationKpiTimeSeries>(
      linkIds,
      year,
      month
    )
    const TeamKpiTimeSeries = data.map((item) => ({
      ...item,
      amount: item.amount * rate,
    }))
    return { ok: true, data: TeamKpiTimeSeries }
  })
}
export async function getTeamOrganizationReferrer(
  orgId: string,
  year?: number,
  month?: number
): Promise<ActionResult<OrganizationReferrerStat[]>> {
  return handleAction("fetching Organization Referrer Stats", async () => {
    const org = await getTeamAuthAction(orgId)
    const { linkIds } = await getOrgAffiliateLinks(org, orgId)
    const referrerStats = await getReferrerStats(linkIds, year, month)
    return { ok: true, data: referrerStats }
  })
}
