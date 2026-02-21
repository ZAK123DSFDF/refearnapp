"use server"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import { user, team, affiliate } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { sendVerificationEmail } from "@/lib/verificationEmail"
import { getOrganizationContext } from "@/lib/server/organization/getOrganizationContext"
import { getTeamContext } from "@/lib/server/team/getTeamContext"
import { getBaseUrl } from "@/lib/server/affiliate/getBaseUrl"
import { buildAffiliateUrl } from "@/util/Url"
import { AppError } from "@/lib/exceptions"
import { handleAction } from "@/lib/handleAction"
import { MutationData } from "@/lib/types/organization/response"

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
}): Promise<MutationData> {
  return handleAction("requestEmailChange", async () => {
    if (!newEmail) {
      throw new AppError({ status: 400, toast: "New email required" })
    }

    // 🧠 Step 1: Check for existing record
    if (isAffiliate && orgId) {
      const existingAffiliate = await db.query.affiliate.findFirst({
        where: and(
          eq(affiliate.email, newEmail),
          eq(affiliate.organizationId, orgId)
        ),
      })
      if (existingAffiliate) {
        throw new AppError({
          status: 400,
          toast: "Email already in use in this organization",
        })
      }
    } else if (isTeam) {
      const existingTeam = await db.query.team.findFirst({
        where: eq(team.email, newEmail),
      })
      if (existingTeam) {
        throw new AppError({
          status: 400,
          toast: "Email already in use",
        })
      }
    } else {
      const existingUser = await db.query.user.findFirst({
        where: eq(user.email, newEmail),
      })
      if (existingUser) {
        throw new AppError({
          status: 400,
          toast: "Email already in use",
        })
      }
    }

    // 🧠 Step 2: Generate token & verify URL based on context
    let token: string
    let verifyUrl: string

    if (isAffiliate && orgId) {
      token = jwt.sign(
        { id, newEmail, type: "AFFILIATE", orgId, mode: "changeEmail" },
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
        { id, newEmail, type, role, orgId, mode: "changeEmail" },
        process.env.SECRET_KEY!,
        { expiresIn: "15m" }
      )
      verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/organization/${orgId}/teams/verify-email-change?teamToken=${token}`
    } else {
      const { orgIds, activeOrgId, role, type } = await getOrganizationContext()
      token = jwt.sign(
        { id, newEmail, type, role, orgIds, activeOrgId, mode: "changeEmail" },
        process.env.SECRET_KEY!,
        { expiresIn: "15m" }
      )
      verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email-change?organizationToken=${token}`
    }
    const brandingOrgId = isAffiliate ? orgId : undefined
    // 🧠 Step 3: Send email
    await sendVerificationEmail(
      newEmail,
      verifyUrl,
      "email-change",
      brandingOrgId
    )

    return {
      ok: true,
      toast: "Verification link sent to new email",
    }
  })
}
