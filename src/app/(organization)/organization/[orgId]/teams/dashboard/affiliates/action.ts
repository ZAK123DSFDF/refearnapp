"use server"

import { ActionResult } from "@/lib/types/response"
import { AffiliateBasePayout, AffiliateStats } from "@/lib/types/affiliateStats"
import { getAffiliatesWithStatsAction } from "@/lib/server/getAffiliatesWithStats"
import { OrderBy, OrderDir } from "@/lib/types/orderTypes"
import { convertedCurrency } from "@/util/ConvertedCurrency"
import { handleAction } from "@/lib/handleAction"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export async function getTeamAffiliatesWithStats(
  orgId: string,
  year?: number,
  month?: number,
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  offset?: number,
  email?: string
): Promise<
  ActionResult<{
    rows: AffiliateStats[]
    hasNext: boolean
  }>
> {
  return handleAction("getAffiliatesWithStats", async () => {
    const ordered = orderBy === "none" ? undefined : orderBy
    const org = await getTeamAuthAction(orgId)
    const PAGE_SIZE = 10
    const rows = (await getAffiliatesWithStatsAction(
      orgId,
      year,
      month,
      undefined,
      {
        exclude: ["paypalEmail"],
        orderBy: ordered,
        orderDir,
        limit: PAGE_SIZE + 1,
        offset: ((offset ?? 1) - 1) * PAGE_SIZE,
        email,
      }
    )) as AffiliateBasePayout[]
    const converted = await convertedCurrency<AffiliateBasePayout>(
      org.currency,
      rows
    )
    return {
      ok: true,
      data: {
        rows: converted.slice(0, PAGE_SIZE),
        hasNext: converted.length > PAGE_SIZE,
      },
    }
  })
}
