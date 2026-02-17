// src/app/api/organization/[orgId]/affiliate-lookup/route.ts
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getAffiliateLookupAction } from "@/lib/server/organization/affiliateLookup"

export const GET = handleRoute(
  "Get Affiliate Lookup",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    // 1. Parsing Params
    const page = Number(searchParams.get("offset") || "1") // Assuming frontend sends page number as 'offset'
    const search = searchParams.get("search") || ""
    const context = (searchParams.get("context") || "admin") as "admin" | "team"

    const PAGE_SIZE = 10

    // 2. 🛡️ Consistent Auth
    if (context === "team") {
      await getTeamAuthAction(orgId)
    } else {
      await getOrgAuth(orgId)
    }

    // 3. Fetch Data (Matching Action signature)
    // We fetch PAGE_SIZE + 1 to check if there is a next page
    const rows = await getAffiliateLookupAction(orgId, {
      search,
      limit: PAGE_SIZE + 1,
      offset: (page - 1) * PAGE_SIZE,
    })

    // 4. Return Consistent Paginated Result
    return NextResponse.json({
      ok: true,
      data: {
        rows: rows.slice(0, PAGE_SIZE),
        hasNext: rows.length > PAGE_SIZE,
      },
    })
  }
)
