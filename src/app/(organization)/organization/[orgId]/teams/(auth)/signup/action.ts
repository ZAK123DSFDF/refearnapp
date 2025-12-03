"use server"

import { team, teamAccount } from "@/db/schema"
import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { customAlphabet } from "nanoid"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"

type CreateAffiliatePayload = {
  name: string
  email: string
  password: string
  organizationId: string
}

// 6-digit alphanumeric ID generator for credentials provider accounts
const generateCredentialsAccountId = customAlphabet("0123456789", 6)

export const SignupTeamServer = async ({
  name,
  email,
  password,
  organizationId,
}: CreateAffiliatePayload): Promise<MutationData> => {
  return handleAction("Signup Team Server", async () => {
    if (!email || !password || !name || !organizationId) {
      throw {
        status: 400,
        error: "Missing required fields.",
        toast: "Please fill in all required fields.",
      }
    }
    const normalizedEmail = email.trim().toLowerCase()
    const existingTeam = await db.query.team.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.email, normalizedEmail), eq(a.organizationId, organizationId)),
    })

    const hashedPassword = await bcrypt.hash(password, 10)

    if (existingTeam) {
      // Check if they already have a credentials account
      const existingAcc = await db.query.teamAccount.findFirst({
        where: (aa, { and, eq }) =>
          and(eq(aa.teamId, existingTeam.id), eq(aa.provider, "credentials")),
      })

      if (existingAcc) {
        throw {
          status: 409,
          error: "Team already exists.",
          toast:
            "This email is already registered with credentials under this organization.",
          data: existingTeam.email,
          fields: { email: "Email already in use" },
        }
      }

      // Add new credentials account under existing affiliate
      await db.insert(teamAccount).values({
        teamId: existingTeam.id,
        provider: "credentials",
        providerAccountId: generateCredentialsAccountId(),
        password: hashedPassword,
      })

      const token = jwt.sign(
        {
          id: existingTeam.id,
          email: existingTeam.email,
          type: existingTeam.type,
          role: existingTeam.role,
          organizationId: existingTeam.organizationId,
        },
        process.env.SECRET_KEY as string,
        { expiresIn: "15m" }
      )
      const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${organizationId}/teams/verify-signup?teamToken=${token}`
      await sendVerificationEmail(existingTeam.email, verifyUrl, "signup")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl: `/organization/${organizationId}/teams/checkEmail?email=${encodeURIComponent(existingTeam.email)}`,
      }
    }

    // Create new affiliate + credentials account
    const [newTeam] = await db
      .insert(team)
      .values({
        name,
        email: normalizedEmail,
        type: "ORGANIZATION",
        role: "TEAM",
        organizationId,
      })
      .returning()

    if (!newTeam) {
      throw {
        status: 500,
        error: "team creation failed.",
        toast: "Something went wrong while creating team",
      }
    }

    await db.insert(teamAccount).values({
      teamId: newTeam.id,
      provider: "credentials",
      providerAccountId: generateCredentialsAccountId(),
      password: hashedPassword,
    })

    const token = jwt.sign(
      {
        id: newTeam.id,
        email: newTeam.email,
        type: newTeam.type,
        role: newTeam.role,
        organizationId: newTeam.organizationId,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${organizationId}/teams/verify-signup?teamToken=${token}`
    if (process.env.NODE_ENV === "development") {
      await sendVerificationEmail(newTeam.email, verifyUrl, "signup")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl: `/organization/${organizationId}/teams/checkEmail?email=${encodeURIComponent(newTeam.email)}`,
      }
    }
    return { ok: true, redirectUrl: verifyUrl }
  })
}
