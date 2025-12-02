"use server"

import { db } from "@/db/drizzle"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

export const ForgotPasswordServer = async ({
  email,
}: {
  email: string
}): Promise<MutationData> => {
  return handleAction("Forgot Password Server", async () => {
    if (!email) {
      throw {
        status: 400,
        error: "Email is required.",
        toast: "Please enter your email.",
        fields: { email: "Email is required" },
      }
    }

    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    })

    if (!existingUser) {
      return {
        ok: true,
        message: "If the email exists, a reset link was sent.",
      }
    }

    const orgs = await db.query.organization.findMany({
      where: (org, { eq }) => eq(org.userId, existingUser.id),
    })

    const orgIds = orgs.map((o) => o.id)
    const activeOrgId = orgIds.length > 0 ? orgIds[0] : undefined
    const payload = {
      id: existingUser.id,
      email: existingUser.email,
      type: existingUser.type,
      role: existingUser.role,
      orgIds,
      activeOrgId,
    }

    const token = jwt.sign(payload, process.env.SECRET_KEY as string, {
      expiresIn: "15m",
    })

    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?organizationToken=${token}`
    if (process.env.NODE_ENV === "development") {
      await sendVerificationEmail(
        existingUser.email,
        resetUrl,
        "reset-password"
      )

      return {
        ok: true,
        toast: "Reset link sent to your email",
        redirectUrl: "/checkEmail",
      }
    }
    return { ok: true, redirectUrl: resetUrl }
  })
}
