import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { getUnpaidPayoutAction } from "@/lib/server/organization/getUnpaidPayout"
export const GET = handleRoute(
  "Get Team Unpaid Months",
  async (_, { orgId }: { orgId: string }) => {
    await getTeamAuthAction(orgId)
    const rows = await getUnpaidPayoutAction(orgId)

    const data = rows.map((row) => ({
      month: row.month,
      year: row.year,
      unpaid: row.unpaid,
    }))

    return NextResponse.json({ ok: true, data })
  }
)
