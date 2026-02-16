import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { handleRoute } from "@/lib/handleRoute"
import { getPromotionCodesAction } from "@/lib/server/organization/getPromotionCodesAction"

export const GET = handleRoute(
  "Get Organization Promotion Codes",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    // 1. Extract Query Parameters
    const code = searchParams.get("code") || undefined
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const orderBy = (searchParams.get("orderBy") as any) || "createdAt"
    const orderDir = (searchParams.get("orderDir") as "asc" | "desc") || "desc"

    const PAGE_SIZE = 10

    // 2. Authorization (Ensures user belongs to org)
    await getOrgAuth(orgId)

    // 3. Fetch Data (Fetch PAGE_SIZE + 1 to check for hasNext)
    const rows = await getPromotionCodesAction(orgId, {
      code,
      limit: PAGE_SIZE + 1,
      offset: (offset - 1) * PAGE_SIZE,
      orderBy,
      orderDir,
    })

    // 4. Response with Pagination Logic
    return NextResponse.json({
      ok: true,
      data: {
        rows: rows.slice(0, PAGE_SIZE),
        hasNext: rows.length > PAGE_SIZE,
      },
    })
  }
)
