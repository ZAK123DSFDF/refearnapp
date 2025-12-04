// app/(organization)/reset-password/action.ts
"use server"

import { db } from "@/db/drizzle"
import { account } from "@/db/schema"
import * as bcrypt from "bcrypt"
import { eq, and } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

export const resetOrganizationPasswordServer = async ({
  userId,
  password,
}: {
  userId: string
  password: string
}): Promise<MutationData> => {
  return handleAction("reset Organization Password", async () => {
    const hashed = await bcrypt.hash(password, 10)

    // 🔑 Update the organization's credentials account password
    const [updatedAccount] = await db
      .update(account)
      .set({ password: hashed })
      .where(
        and(eq(account.userId, userId), eq(account.provider, "credentials"))
      )
      .returning()

    if (!updatedAccount) {
      throw {
        status: 500,
        toast: "Organization credentials account not found",
      }
    }

    // 🔑 Fetch organization to normalize email & session payload
    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, userId),
    })

    if (!existingUser) {
      throw {
        status: 500,
        toast: "Organization not found",
      }
    }

    // Find organizations owned by this user
    const orgs = await db.query.organization.findMany({
      where: (org, { eq }) => eq(org.userId, existingUser.id),
    })

    const orgIds = orgs.map((o) => o.id)
    const activeOrgId = orgIds.length > 0 ? orgIds[0] : undefined

    const sessionPayload = {
      id: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      type: existingUser.type,
      orgIds,
      activeOrgId,
    }

    // Sign JWT & set cookie
    const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: "7d",
    })

    const cookieStore = await cookies()
    cookieStore.set("organizationToken", sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return {
      ok: true,
      redirectUrl: activeOrgId
        ? `/organization/${activeOrgId}/dashboard/analytics`
        : `/create-company`,
    }
  })
}
