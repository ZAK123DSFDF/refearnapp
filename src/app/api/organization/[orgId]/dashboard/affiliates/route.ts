import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getAffiliatesWithStatsAction } from "@/lib/server/affiliate/getAffiliatesWithStats"
import { convertedCurrency } from "@/util/ConvertedCurrency"
import { handleRoute } from "@/lib/handleRoute"
import { AffiliateBasePayout } from "@/lib/types/affiliate/affiliateStats"
import { OrderBy, OrderDir } from "@/lib/types/analytics/orderTypes"

export const GET = handleRoute(
  "Get Organization Affiliates Stats",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    // 1. Extract Query Parameters
    const year = searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined
    const month = searchParams.get("month")
      ? Number(searchParams.get("month"))
      : undefined
    const orderBy = (searchParams.get("orderBy") as OrderBy) || "none"
    const orderDir = (searchParams.get("orderDir") as OrderDir) || "desc"
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const email = searchParams.get("email") || undefined

    const PAGE_SIZE = 10
    const ordered = orderBy === "none" ? undefined : orderBy

    // 2. Authorization
    const org = await getOrgAuth(orgId)

    // 3. Fetch Data
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
        offset: (offset - 1) * PAGE_SIZE,
        email,
      }
    )) as AffiliateBasePayout[]

    // 4. Currency Conversion
    const converted = await convertedCurrency<AffiliateBasePayout>(
      org.currency,
      rows
    )

    // 5. Response with Pagination Logic
    return NextResponse.json({
      ok: true,
      data: {
        rows: converted.slice(0, PAGE_SIZE),
        hasNext: converted.length > PAGE_SIZE,
      },
    })
  }
)
