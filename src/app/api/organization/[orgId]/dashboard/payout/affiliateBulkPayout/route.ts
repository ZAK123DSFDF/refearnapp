import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getAffiliatePayoutBulkData } from "@/lib/server/affiliate/getAffiliatePayoutBulkData"
import { OrderDir } from "@/lib/types/analytics/orderTypes"
import { PayoutSortKeys } from "@/lib/types/organization/PayoutSortKeys"
export const GET = handleRoute(
  "Get Affiliate Bulk Payouts",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const mode = (searchParams.get("mode") as "TABLE" | "EXPORT") || "TABLE"
    const orderBy = (searchParams.get("orderBy") as PayoutSortKeys) || undefined
    const orderDir = (searchParams.get("orderDir") as OrderDir) || undefined
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const email = searchParams.get("email") || undefined

    // Expecting a JSON string like: ?months=[{"month":1,"year":2024}]
    const monthsRaw = searchParams.get("months")
    const months = monthsRaw ? JSON.parse(monthsRaw) : []

    const org = await getOrgAuth(orgId)

    const result = await getAffiliatePayoutBulkData(
      mode,
      org,
      orgId,
      months,
      orderBy,
      orderDir,
      offset,
      email
    )

    return NextResponse.json(result)
  }
)
