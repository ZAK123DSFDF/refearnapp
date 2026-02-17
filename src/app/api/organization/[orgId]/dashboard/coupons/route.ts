import { NextResponse } from "next/server"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { handleRoute } from "@/lib/handleRoute"
import { getPromotionCodesAction } from "@/lib/server/organization/getPromotionCodesAction"
import { ExchangeRate } from "@/util/ExchangeRate"

export const GET = handleRoute(
  "Get Organization Promotion Codes",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    const code = searchParams.get("code") || undefined
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const orderBy = (searchParams.get("orderBy") as any) || "createdAt"
    const orderDir = (searchParams.get("orderDir") as "asc" | "desc") || "desc"

    const PAGE_SIZE = 10

    // 1. Get Auth AND Org Currency/Rate
    const org = await getOrgAuth(orgId)
    const rate = await ExchangeRate(org.currency)
    const rows = await getPromotionCodesAction(orgId, {
      code,
      limit: PAGE_SIZE + 1,
      offset: (offset - 1) * PAGE_SIZE,
      orderBy,
      orderDir,
    })
    const convertedRows = rows.map((row) => ({
      ...row,
      discountValue:
        row.discountType === "FLAT_FEE"
          ? (Number(row.discountValue) * rate).toString()
          : row.discountValue,
      commissionValue:
        row.commissionType === "FLAT_FEE"
          ? (Number(row.commissionValue) * rate).toString()
          : row.commissionValue,
      currency: org.currency,
    }))

    return NextResponse.json({
      ok: true,
      data: {
        rows: convertedRows.slice(0, PAGE_SIZE),
        hasNext: rows.length > PAGE_SIZE,
      },
    })
  }
)
