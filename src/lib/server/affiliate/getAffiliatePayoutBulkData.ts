import { getAffiliatePayoutBulkAction } from "@/lib/server/affiliate/getAffiliatePayoutBulk"
import { AffiliatePayout } from "@/lib/types/affiliate/affiliateStats"
import { convertedCurrency } from "@/util/ConvertedCurrency"
import { OrderDir } from "@/lib/types/analytics/orderTypes"
import { OrgAuthResult } from "@/lib/types/organization/orgAuth"
import { ActionResult } from "@/lib/types/organization/response"
import { PayoutResult } from "@/lib/types/organization/payoutResult"
import { AppError } from "@/lib/exceptions"
import { PayoutSortKeys } from "@/lib/types/organization/PayoutSortKeys"

export async function getAffiliatePayoutBulkData(
  mode: "TABLE" | "EXPORT" = "TABLE",
  org: OrgAuthResult,
  orgId: string,
  months: { month: number; year: number }[],
  orderBy?: PayoutSortKeys,
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
      throw new AppError({
        status: 400,
        toast: "No unpaid commissions with PayPal email found",
      })
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
