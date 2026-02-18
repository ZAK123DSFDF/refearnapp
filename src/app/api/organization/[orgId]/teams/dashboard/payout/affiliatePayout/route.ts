import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { getAffiliatePayoutData } from "@/lib/server/affiliate/getAffiliatePayoutData"
import { OrderDir } from "@/lib/types/analytics/orderTypes"
import { PayoutSortKeys } from "@/lib/types/organization/PayoutSortKeys"

export const GET = handleRoute(
  "Get Team Affiliate Payouts",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const mode = (searchParams.get("mode") as "TABLE" | "EXPORT") || "TABLE"
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined
    const orderBy = (searchParams.get("orderBy") as PayoutSortKeys) || undefined
    const orderDir = (searchParams.get("orderDir") as OrderDir) || undefined
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const email = searchParams.get("email") || undefined

    const org = await getTeamAuthAction(orgId)

    const result = await getAffiliatePayoutData(
      mode,
      org,
      orgId,
      year,
      month,
      orderBy,
      orderDir,
      offset,
      email
    )

    return NextResponse.json(result)
  }
)
