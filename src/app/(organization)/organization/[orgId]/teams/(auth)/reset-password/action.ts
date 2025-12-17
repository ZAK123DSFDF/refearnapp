// app/affiliate/[orgId]/reset-password/action.ts
"use server"
import { teamAccount } from "@/db/schema"
import * as bcrypt from "bcryptjs"
import { eq, and } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { getDB } from "@/db/drizzle"

export const resetTeamPasswordServer = async ({
  teamId,
  orgId,
  password,
}: {
  teamId: string
  orgId: string
  password: string
}): Promise<MutationData> => {
  return handleAction("reset Affiliate Password", async () => {
    const hashed = await bcrypt.hash(password, 10)
    const db = await getDB()
    // 🔑 Update the credentials account password (not affiliate directly)
    const [updatedTeamAccount] = await db
      .update(teamAccount)
      .set({ password: hashed })
      .where(
        and(
          eq(teamAccount.teamId, teamId),
          eq(teamAccount.provider, "credentials")
        )
      )
      .returning()

    if (!updatedTeamAccount) {
      throw {
        status: 500,
        toast: "Affiliate credentials account not found",
      }
    }

    // 🔑 Fetch affiliate to normalize email & session payload
    const existingTeam = await db.query.team.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.id, teamId), eq(a.organizationId, orgId)),
    })

    if (!existingTeam) {
      throw {
        status: 500,
        toast: "Affiliate not found",
      }
    }

    const sessionPayload = {
      id: existingTeam.id,
      email: existingTeam.email,
      type: existingTeam.type,
      role: existingTeam.role,
      orgId: existingTeam.organizationId,
    }

    // Sign JWT & set cookie
    const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: "7d",
    })

    const cookieStore = await cookies()
    cookieStore.set(`teamToken-${orgId}`, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return {
      ok: true,
      redirectUrl: `/organization/${orgId}/teams/dashboard/analytics`,
    }
  })
}
