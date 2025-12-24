import { getAffiliatePayoutBulkAction } from "@/lib/server/getAffiliatePayoutBulk"
import { AffiliatePayout } from "@/lib/types/affiliateStats"
import { convertedCurrency } from "@/util/ConvertedCurrency"
import { OrderBy, OrderDir } from "@/lib/types/orderTypes"
import { OrgAuthResult } from "@/lib/types/orgAuth"
import { ActionResult } from "@/lib/types/response"
import { PayoutResult } from "@/lib/types/payoutResult"

export async function getAffiliatePayoutBulkData(
  mode: "TABLE" | "EXPORT" = "TABLE",
  org: OrgAuthResult,
  orgId: string,
  months: { month: number; year: number }[],
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  offset?: number,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  const PAGE_SIZE = 10
  const isExport = mode === "EXPORT"
  const rows = (await getAffiliatePayoutBulkAction(
    orgId,
    months,
    orderBy === "none" ? undefined : orderBy,
    orderDir,
    isExport ? undefined : PAGE_SIZE + 1,
    isExport ? undefined : ((offset ?? 1) - 1) * PAGE_SIZE,
    email
  )) as AffiliatePayout[]
  const converted = await convertedCurrency<AffiliatePayout>(org.currency, rows)
  if (isExport) {
    const validRows = converted.filter(
      (r) => r.unpaid > 0 && r.paypalEmail?.trim()
    )

    if (validRows.length === 0) {
      throw {
        status: 400,
        toast: "No unpaid commissions with PayPal email found",
      }
    }

    return {
      ok: true,
      data: {
        mode: "EXPORT",
        rows: validRows,
      },
    }
  }

  return {
    ok: true,
    data: {
      mode: "TABLE",
      rows: converted.slice(0, PAGE_SIZE),
      hasNext: converted.length > PAGE_SIZE,
    },
  }
}
