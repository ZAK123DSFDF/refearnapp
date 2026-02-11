import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getUnpaidPayoutAction } from "@/lib/server/organization/getUnpaidPayout"
export const GET = handleRoute(
  "Get Unpaid Months",
  async (_, { orgId }: { orgId: string }) => {
    await getOrgAuth(orgId)
    const rows = await getUnpaidPayoutAction(orgId)

    const data = rows.map((row) => ({
      month: row.month,
      year: row.year,
      unpaid: row.unpaid,
    }))

    return NextResponse.json({ ok: true, data })
  }
)
