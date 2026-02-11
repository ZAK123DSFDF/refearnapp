import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { db } from "@/db/drizzle"
import { team } from "@/db/schema"
import { and, eq, ilike } from "drizzle-orm"
export const GET = handleRoute(
  "Get Team Members",
  async (req, { orgId }: { orgId: string }) => {
    const { searchParams } = new URL(req.url)

    // 1. Extract Query Parameters
    const offset = searchParams.get("offset")
      ? Number(searchParams.get("offset"))
      : 1
    const email = searchParams.get("email") || undefined
    const PAGE_SIZE = 10

    // 2. 🔐 Authorization
    await getOrgAuth(orgId)

    // 3. Build Query
    const whereClauses = [eq(team.organizationId, orgId)]

    if (email) {
      whereClauses.push(ilike(team.email, `%${email}%`))
    }

    // 4. Fetch Data
    const rows = await db
      .select({
        id: team.id,
        email: team.email,
        isActive: team.isActive,
      })
      .from(team)
      .where(and(...whereClauses))
      .limit(PAGE_SIZE + 1)
      .offset((offset - 1) * PAGE_SIZE)
      .orderBy(team.createdAt)

    // 5. Response with Pagination
    return NextResponse.json({
      ok: true,
      data: {
        rows: rows.slice(0, PAGE_SIZE),
        hasNext: rows.length > PAGE_SIZE,
      },
    })
  }
)
