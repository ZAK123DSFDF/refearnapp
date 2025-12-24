"use server"
import { getAffiliatePayoutAction } from "@/lib/server/getAffiliatePayout"
import { AffiliatePayout } from "@/lib/types/affiliateStats"
import { convertedCurrency } from "@/util/ConvertedCurrency"
import { OrderBy, OrderDir } from "@/lib/types/orderTypes"
import { PayoutResult } from "@/lib/types/payoutResult"
import { ActionResult } from "@/lib/types/response"
import { OrgAuthResult } from "@/lib/types/orgAuth"

export async function getAffiliatePayoutData(
  mode: "TABLE" | "EXPORT" = "TABLE",
  org: OrgAuthResult,
  orgId: string,
  year?: number,
  month?: number,
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  offset?: number,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  const PAGE_SIZE = 10
  const isExport = mode === "EXPORT"
  const rows = (await getAffiliatePayoutAction(
    orgId,
    year,
    month,
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
