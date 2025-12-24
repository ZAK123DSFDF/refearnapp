"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import { team } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { handleAction } from "@/lib/handleAction"
import { ActionResult } from "@/lib/types/response"

export const verifyAndDeleteTeamSessionAction = async (
  orgId: string
): Promise<ActionResult<{ reason: string }>> => {
  return handleAction("Verify and Delete Team Session", async () => {
    const cookieStore = await cookies()
    const cookieName = `teamToken-${orgId}`
    const token = cookieStore.get(cookieName)?.value

    if (!token) {
      throw { status: 401, toast: "No session token found" }
    }

    const { id: teamId } = jwt.decode(token) as { id: string }

    const teamData = await db
      .select({
        id: team.id,
        orgId: team.organizationId,
        isActive: team.isActive,
      })
      .from(team)
      .where(and(eq(team.id, teamId), eq(team.organizationId, orgId)))
      .then((r) => r[0])

    if (!teamData) {
      cookieStore.delete(cookieName)
      throw { status: 404, toast: "Team not found or unauthorized" }
    }

    if (!teamData.isActive) {
      cookieStore.delete(cookieName)
      throw { status: 403, toast: "Team deactivated by owner" }
    }

    // ✅ match ResponseData<T>
    return { ok: true, data: { reason: "team_valid" } }
  })
}
