// @/app/api/organization/[orgId]/affiliate/coupons/route.ts
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getAffiliateCouponsAction } from "@/lib/server/affiliate/getAffiliateCouponsAction"
import { getOrganization } from "@/lib/server/organization/getOrganization"
import { ExchangeRate } from "@/util/ExchangeRate"
import { getAffiliateOrganization } from "@/lib/server/affiliate/GetAffiliateOrganization"

export const GET = handleRoute(
  "Get Affiliate Promotion Codes",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)
    const offset = Number(searchParams.get("offset") || 1)
    const PAGE_SIZE = 10

    const decoded = await getAffiliateOrganization(orgId)
    const org = await getOrganization(orgId)
    const rate = await ExchangeRate(org.currency)

    const rows = await getAffiliateCouponsAction(orgId, decoded.id, {
      limit: PAGE_SIZE + 1,
      offset: (offset - 1) * PAGE_SIZE,
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
