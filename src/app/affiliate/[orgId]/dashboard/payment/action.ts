// actions/getAffiliateCommissionByMonth.ts
"use server"
import { getAffiliateOrganization } from "@/lib/server/GetAffiliateOrganization"
import { AffiliatePaymentRow } from "@/lib/types/affiliatePaymentRow"
import { ActionResult } from "@/lib/types/response"
import { getAffiliateCommissionByMonthAction } from "@/lib/server/getAffiliateCommissionByMonth"
import { getOrganization } from "@/lib/server/getOrganization"
import { ExchangeRate } from "@/util/ExchangeRate"
import { handleAction } from "@/lib/handleAction"

export const getAffiliateCommissionByMonth = async (
  orgId: string,
  year?: number
): Promise<ActionResult<AffiliatePaymentRow[]>> => {
  return handleAction("getAffiliateCommissionByMonth", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    const targetYear = year ?? new Date().getFullYear()
    const rows = await getAffiliateCommissionByMonthAction(decoded, targetYear)
    const org = await getOrganization(decoded.orgId)
    const rate = await ExchangeRate(org.currency)
    const convertedRows: AffiliatePaymentRow[] = rows.map((row) => ({
      ...row,
      totalCommission: (row.totalCommission ?? 0) * rate,
      paidCommission: (row.paidCommission ?? 0) * rate,
      unpaidCommission: (row.unpaidCommission ?? 0) * rate,
      currency: org.currency,
    }))
    return { ok: true, data: convertedRows }
  })
}
