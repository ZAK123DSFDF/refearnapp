import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"

export const GET = handleRoute(
  "Get Org Currency",
  async (_, { orgId }: { orgId: string }) => {
    const org = await db.query.organization.findFirst({
      where: eq(organization.id, orgId),
      columns: {
        currency: true,
      },
    })

    return NextResponse.json({
      ok: true,
      data: org?.currency ?? "USD",
    })
  }
)
