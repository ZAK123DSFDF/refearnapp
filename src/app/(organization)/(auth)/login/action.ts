"use server"

import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

export const LoginServer = async ({
  email,
  password,
  rememberMe = false,
}: {
  email: string
  password: string
  rememberMe?: boolean
}): Promise<MutationData> => {
  return handleAction("Login Server", async () => {
    if (!email || !password) {
      throw {
        status: 400,
        error: "Email and password are required.",
        toast: "Please enter your login credentials.",
        fields: {
          email: !email ? "Email is required" : "",
          password: !password ? "Password is required" : "",
        },
      }
    }

    // Find the user by email
    const existingUser = await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    })

    if (!existingUser) {
      throw {
        status: 404,
        error: "User not found.",
        toast: "Invalid credentials. Please check your email and password.",
        fields: { email: "User not found" },
      }
    }

    // Find the user account with provider = 'credentials'
    const userAcc = await db.query.account.findFirst({
      where: (ua, { and, eq }) =>
        and(eq(ua.userId, existingUser.id), eq(ua.provider, "credentials")),
    })

    if (!userAcc || !userAcc.password) {
      throw {
        status: 401,
        error: "User account not found.",
        toast: "Invalid credentials. No password found for this user.",
      }
    }

    const validPassword = await bcrypt.compare(password, userAcc.password)

    if (!validPassword) {
      throw {
        status: 401,
        error: "Invalid password.",
        toast: "Invalid credentials. Please check your password.",
        fields: { password: "Invalid password" },
      }
    }

    // Get organizations owned by this user
    const orgs = await db.query.organization.findMany({
      where: (org, { eq }) => eq(org.userId, existingUser.id),
    })

    const orgIds = orgs.map((o) => o.id)
    const activeOrgId = orgIds.length > 0 ? orgIds[0] : undefined

    const token = jwt.sign(
      {
        id: existingUser.id,
        email: existingUser.email,
        role: existingUser.role,
        type: existingUser.type,
        orgIds,
        activeOrgId,
        rememberMe,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )

    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-login?organizationToken=${token}`
    if (process.env.NODE_ENV === "development") {
      await sendVerificationEmail(existingUser.email, verifyUrl, "login")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl: "/checkEmail",
      }
    }
    return { ok: true, redirectUrl: verifyUrl }
  })
}
