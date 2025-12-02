"use server"

import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { buildAffiliateUrl } from "@/util/Url"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
export const LoginTeamServer = async ({
  email,
  password,
  organizationId,
  rememberMe = false,
}: {
  email: string
  password: string
  organizationId: string
  rememberMe?: boolean
}): Promise<MutationData> => {
  return handleAction("Login Team Server", async () => {
    if (!email || !password || !organizationId) {
      throw {
        status: 400,
        error: "Email, password, and organization ID are required.",
        toast: "Please enter your login credentials.",
      }
    }

    // Find the affiliate by organization and email
    const existingTeam = await db.query.team.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.email, email), eq(a.organizationId, organizationId)),
    })

    if (!existingTeam) {
      throw {
        status: 404,
        error: "team not found.",
        toast:
          "Invalid credentials. Please check your email, password, and organization.",
        fields: { email: "team not found in this organization" },
      }
    }
    if (!existingTeam.isActive) {
      throw {
        status: 403,
        error: "Team deactivated.",
        toast:
          "Your team account has been deactivated by the organization owner.",
        fields: { email: "This account is currently deactivated" },
      }
    }

    // Find the affiliate account with provider = 'credentials'
    const teamAcc = await db.query.teamAccount.findFirst({
      where: (aa, { and, eq }) =>
        and(eq(aa.teamId, existingTeam.id), eq(aa.provider, "credentials")),
    })

    if (!teamAcc || !teamAcc.password) {
      throw {
        status: 401,
        error: "Affiliate account not found.",
        toast: "Invalid credentials. No password found for this team.",
      }
    }

    const validPassword = await bcrypt.compare(password, teamAcc.password)

    if (!validPassword) {
      throw {
        status: 401,
        error: "Invalid password.",
        toast: "Invalid credentials. Please check your password.",
        fields: { password: "Invalid password" },
      }
    }

    const token = jwt.sign(
      {
        id: existingTeam.id,
        email: existingTeam.email,
        type: existingTeam.type,
        role: existingTeam.role,
        organizationId: existingTeam.organizationId,
        rememberMe,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${organizationId}/teams/verify-login?teamToken=${token}`
    if (process.env.NODE_ENV === "development") {
      await sendVerificationEmail(existingTeam.email, verifyUrl, "login")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl: `/organization/${organizationId}/teams/checkEmail`,
      }
    }
    return { ok: true, redirectUrl: verifyUrl }
  })
}
