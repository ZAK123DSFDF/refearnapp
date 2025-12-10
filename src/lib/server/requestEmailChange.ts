// lib/server/requestEmailChange.ts
"use server"

import jwt from "jsonwebtoken"
import { user, team, affiliate } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { sendVerificationEmail } from "@/lib/mail"
import { returnError } from "@/lib/errorHandler"
import { getOrganizationContext } from "@/lib/server/getOrganizationContext"
import { getTeamContext } from "@/lib/server/getTeamContext"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { buildAffiliateUrl } from "@/util/Url"
import { getDB } from "@/db/drizzle"

type BaseResponse = { ok: boolean; message?: string; redirectUrl?: string }

export async function requestEmailChange({
  orgId,
  id,
  newEmail,
  isTeam = false,
  isAffiliate = false,
}: {
  orgId?: string
  id: string
  newEmail: string
  isTeam?: boolean
  isAffiliate?: boolean
}): Promise<BaseResponse> {
  try {
    if (!newEmail) throw { status: 400, toast: "New email required" }
    const db = await getDB()
    // 🧠 Step 1: check for existing record
    if (isAffiliate && orgId) {
      const existingAffiliate = await db.query.affiliate.findFirst({
        where: and(
          eq(affiliate.email, newEmail),
          eq(affiliate.organizationId, orgId)
        ),
      })
      if (existingAffiliate)
        throw {
          status: 400,
          toast: "Email already in use in this organization",
          data: existingAffiliate.email,
        }
    } else if (isTeam) {
      const existingTeam = await db.query.team.findFirst({
        where: eq(team.email, newEmail),
      })
      if (existingTeam)
        throw {
          status: 400,
          toast: "Email already in use",
          data: existingTeam.email,
        }
    } else {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, newEmail),
      })
      if (existingUser)
        throw {
          status: 400,
          toast: "Email already in use",
          data: existingUser.email,
        }
    }

    // 🧠 Step 2: generate token & verify URL based on context
    let token: string
    let verifyUrl: string

    if (isAffiliate && orgId) {
      token = jwt.sign(
        {
          id,
          newEmail,
          type: "AFFILIATE",
          orgId,
          mode: "changeEmail",
        },
        process.env.SECRET_KEY!,
        { expiresIn: "15m" }
      )
      const baseUrl = await getBaseUrl()
      verifyUrl = buildAffiliateUrl({
        path: "verify-email-change",
        organizationId: orgId,
        token,
        baseUrl,
      })
    } else if (isTeam && orgId) {
      const { role, type } = await getTeamContext(orgId)
      token = jwt.sign(
        {
          id,
          newEmail,
          type,
          role,
          orgId,
          mode: "changeEmail",
        },
        process.env.SECRET_KEY!,
        { expiresIn: "15m" }
      )
      verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/teams/verify-email-change?teamToken=${token}`
    } else {
      const { orgIds, activeOrgId, role, type } = await getOrganizationContext()
      token = jwt.sign(
        {
          id,
          newEmail,
          type,
          role,
          orgIds,
          activeOrgId,
          mode: "changeEmail",
        },
        process.env.SECRET_KEY!,
        { expiresIn: "15m" }
      )
      verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email-change?organizationToken=${token}`
    }

    // 🧠 Step 3: send email or return redirect
    await sendVerificationEmail(newEmail, verifyUrl, "email-change")
    return { ok: true, message: "Verification link sent to new email" }
  } catch (err) {
    console.error("requestEmailChange error:", err)
    return returnError(err)
  }
}
