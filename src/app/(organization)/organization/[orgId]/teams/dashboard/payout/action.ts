"use server"
import { ActionResult } from "@/lib/types/response"
import { UnpaidMonth } from "@/lib/types/unpaidMonth"
import { AffiliatePayout } from "@/lib/types/affiliateStats"
import { getUnpaidPayoutAction } from "@/lib/server/getUnpaidPayout"
import { OrderBy, OrderDir } from "@/lib/types/orderTypes"
import { handleAction } from "@/lib/handleAction"

import { createOrganizationAffiliatePayout } from "@/lib/organizationAction/createOrganizationAffiliatePayout"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"
import { PayoutResult } from "@/lib/types/payoutResult"
import { getAffiliatePayoutData } from "@/lib/server/getAffiliatePayoutData"
import { getAffiliatePayoutBulkData } from "@/lib/server/getAffiliatePayoutBulkData"
import { getOrgAuth } from "@/lib/server/GetOrgAuth"
import { InsertedRef } from "@/lib/types/insertedRef"
import { CreatePayoutInput } from "@/lib/types/createPayoutInput"
export async function getTeamAffiliatePayouts(
  mode: "TABLE" | "EXPORT" = "TABLE",
  orgId: string,
  year?: number,
  month?: number,
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  offset?: number,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  return handleAction("getTeamAffiliatePayouts", async () => {
    const org = await getTeamAuthAction(orgId)
    return getAffiliatePayoutData(
      mode,
      org,
      orgId,
      year,
      month,
      orderBy,
      orderDir,
      offset,
      email
    )
  })
}
export async function getTeamExportAffiliatePayouts(
  orgId: string,
  year?: number,
  month?: number,
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  return handleAction("getTeamExportAffiliatePayouts", async () => {
    const org = await getTeamAuthAction(orgId)
    return getAffiliatePayoutData(
      "EXPORT",
      org,
      orgId,
      year,
      month,
      orderBy,
      orderDir,
      undefined,
      email
    )
  })
}
export async function getTeamAffiliatePayoutsBulk(
  mode: "TABLE" | "EXPORT" = "TABLE",
  orgId: string,
  months: { month: number; year: number }[],
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  offset?: number,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  return handleAction("getAffiliatePayoutsBulk", async () => {
    const org = await getTeamAuthAction(orgId)
    return getAffiliatePayoutBulkData(
      mode,
      org,
      orgId,
      months,
      orderBy,
      orderDir,
      offset,
      email
    )
  })
}
export async function getTeamExportAffiliatePayoutsBulk(
  orgId: string,
  months: { month: number; year: number }[],
  orderBy?: OrderBy,
  orderDir?: OrderDir,
  email?: string
): Promise<ActionResult<PayoutResult<AffiliatePayout>>> {
  return handleAction("getTeamExportAffiliatePayoutsBulk", async () => {
    const org = await getOrgAuth(orgId)
    return getAffiliatePayoutBulkData(
      "EXPORT",
      org,
      orgId,
      months,
      orderBy,
      orderDir,
      undefined,
      email
    )
  })
}
export async function getTeamUnpaidMonths(
  orgId: string
): Promise<ActionResult<UnpaidMonth[]>> {
  return handleAction("getUnpaidMonths", async () => {
    await getTeamAuthAction(orgId)
    const rows = await getUnpaidPayoutAction(orgId)

    return {
      ok: true,
      data: rows.map((row) => ({
        month: row.month,
        year: row.year,
        unpaid: row.unpaid,
      })),
    }
  })
}

export async function createTeamAffiliatePayouts({
  orgId,
  affiliateIds,
  isUnpaid,
  months,
}: CreatePayoutInput): Promise<ActionResult<InsertedRef[]>> {
  return handleAction("createTeamAffiliatePayouts", async () => {
    await getTeamAuthAction(orgId)
    const insertedRefs = await createOrganizationAffiliatePayout({
      orgId,
      affiliateIds,
      isUnpaid,
      months,
    })
    return { ok: true, data: insertedRefs }
  })
}
