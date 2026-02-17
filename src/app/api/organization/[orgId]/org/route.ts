import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrg } from "@/lib/server/organization/getOrg"

export const GET = handleRoute(
  "Get Org",
  async (_, { orgId }: { orgId: string }) => {
    const org = await getOrg(orgId)
    return NextResponse.json({ ok: true, data: org })
  }
)
