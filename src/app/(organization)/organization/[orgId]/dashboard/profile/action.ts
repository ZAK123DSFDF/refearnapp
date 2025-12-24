// app/actions/auth/getUser.ts
"use server"
import { db } from "@/db/drizzle"
import { account, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import * as bcrypt from "bcrypt"
import { ActionResult, MutationData } from "@/lib/types/response"
import { SafeUserWithCapabilities } from "@/lib/types/authUser"
import { revalidatePath } from "next/cache"
import { getUserAuthCapabilities } from "@/lib/server/getUserAuthCapabilities"
import { getCurrentUser } from "@/lib/server/getCurrentUser"
import { handleAction } from "@/lib/handleAction"

export const getUserData = async (): Promise<
  ActionResult<SafeUserWithCapabilities>
> => {
  return handleAction("getUserData", async () => {
    const { userId, canChangePassword, canChangeEmail } =
      await getUserAuthCapabilities()

    const userData = await db.query.user.findFirst({
      where: eq(user.id, userId),
    })

    if (!userData) {
      throw {
        status: 404,
        error: "User not found",
        toast: "Your account could not be found.",
      }
    }

    return {
      ok: true,
      data: {
        ...userData,
        canChangeEmail,
        canChangePassword,
      },
    }
  })
}
export async function updateUserProfile(
  orgId: string,
  data: { name?: string }
): Promise<MutationData> {
  return handleAction("updateUserProfile", async () => {
    const { id } = await getCurrentUser()
    if (!id) throw { status: 401, toast: "Unauthorized" }
    if (!data.name) return { ok: true }

    await db.update(user).set({ name: data.name }).where(eq(user.id, id))
    revalidatePath(`/organization/${orgId}/dashboard/profile`)
    return { ok: true, toast: "Successfully Updated Profile" }
  })
}

export async function validateCurrentOrganizationPassword(
  currentPassword: string
): Promise<MutationData> {
  return handleAction("validating current Organization Password", async () => {
    const { id } = await getCurrentUser()
    if (!id) throw { status: 401, toast: "Unauthorized" }

    // Get account by userId
    const record = await db.query.account.findFirst({
      where: eq(account.userId, id),
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
export async function updateUserPassword(
  newPassword: string
): Promise<MutationData> {
  return handleAction("updating User Password", async () => {
    const { userId, canChangePassword } = await getUserAuthCapabilities()

    if (!canChangePassword) {
      throw { status: 403, toast: "This account cannot change password" }
    }

    const hashed = await bcrypt.hash(newPassword, 10)

    const result = await db
      .update(account)
      .set({ password: hashed })
      .where(eq(account.userId, userId))
      .returning()

    if (!result.length) {
      throw { status: 404, toast: "Account not found" }
    }

    return { ok: true, toast: "Successfully Updated Password" }
  })
}
