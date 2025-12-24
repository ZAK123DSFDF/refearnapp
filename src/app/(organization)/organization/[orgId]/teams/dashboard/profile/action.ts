// app/actions/auth/getUser.ts
"use server"
import { db } from "@/db/drizzle"
import { team, teamAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt"
import { ActionResult, MutationData } from "@/lib/types/response"
import { SafeTeamWithCapabilities } from "@/lib/types/authUser"
import { revalidatePath } from "next/cache"
import { handleAction } from "@/lib/handleAction"
import { getTeamAuthCapabilities } from "@/lib/server/getTeamAuthCapabilities"
import { getCurrentTeam } from "@/lib/server/getCurrentTeam"
import { getTeamAuthAction } from "@/lib/server/getTeamAuthAction"

export const getTeamData = async (
  orgId: string
): Promise<ActionResult<SafeTeamWithCapabilities>> => {
  return handleAction("get Team Data", async () => {
    await getTeamAuthAction(orgId)
    const { userId, canChangePassword, canChangeEmail } =
      await getTeamAuthCapabilities(orgId)

    const teamData = await db.query.team.findFirst({
      where: eq(team.id, userId),
    })

    if (!teamData) {
      throw {
        status: 404,
        error: "User not found",
        toast: "Your account could not be found.",
      }
    }

    return {
      ok: true,
      data: {
        ...teamData,
        canChangeEmail,
        canChangePassword,
      },
    }
  })
}
export async function updateTeamProfile(
  orgId: string,
  data: { name?: string }
): Promise<MutationData> {
  return handleAction("update Team Profile", async () => {
    await getTeamAuthAction(orgId)
    const { id } = await getCurrentTeam(orgId)
    if (!id) throw { status: 401, toast: "Unauthorized" }
    if (!data.name) return { ok: true }

    await db.update(team).set({ name: data.name }).where(eq(team.id, id))
    revalidatePath(`/organization/${orgId}/teams/dashboard/profile`)
    return { ok: true, toast: "Successfully Updated Profile" }
  })
}

export async function validateCurrentTeamPassword(
  orgId: string,
  currentPassword: string
): Promise<MutationData> {
  return handleAction("validating current Team Password", async () => {
    await getTeamAuthAction(orgId)
    const { id } = await getCurrentTeam(orgId)
    if (!id) throw { status: 401, toast: "Unauthorized" }

    // Get account by userId
    const record = await db.query.teamAccount.findFirst({
      where: eq(teamAccount.teamId, id),
    })
    if (!record || !record.password) {
      throw { status: 404, toast: "Account not found" }
    }

    const isMatch = await bcrypt.compare(currentPassword, record.password)
    if (!isMatch) {
      throw {
        status: 403,
        toast: "Incorrect current password",
        data: currentPassword,
      }
    }

    return { ok: true, toast: "Validated Password" }
  })
}
export async function updateTeamPassword(
  orgId: string,
  newPassword: string
): Promise<MutationData> {
  return handleAction("updating User Password", async () => {
    await getTeamAuthAction(orgId)
    const { userId, canChangePassword } = await getTeamAuthCapabilities(orgId)

    if (!canChangePassword) {
      throw { status: 403, toast: "This account cannot change password" }
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    const result = await db
      .update(teamAccount)
      .set({ password: hashed })
      .where(eq(teamAccount.teamId, userId))
      .returning()

    if (!result.length) {
      throw { status: 404, toast: "Account not found" }
    }

    return { ok: true, toast: "Successfully Updated Password" }
  })
}
