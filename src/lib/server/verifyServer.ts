"use server"

import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import {
  account,
  affiliate,
  affiliateAccount,
  team,
  teamAccount,
  user,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { db } from "@/db/drizzle"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { buildAffiliateUrl } from "@/util/Url"
import { assignFreeTrialSubscription } from "@/lib/server/assignFreeTrial"
import { assignLifetimePurchase } from "@/lib/server/assignLifetimePurchase"

type VerifyServerProps = {
  token: string
  mode: "login" | "signup" | "changeEmail"
  redirectUrl?: string
}

type SessionPayload = {
  id: string
  email: string
  type: string
  role: string
  orgIds?: string[]
  activeOrgId?: string
  orgId?: string
}
export const VerifyServer = async ({
  token,
  mode,
  redirectUrl,
}: VerifyServerProps) => {
  let tokenType: "organization" | "affiliate" = "organization"
  let tokenRole: "owner" | "team" | null = null
  let orgIds: string[] = []
  let activeOrgId: string | undefined
  let orgId: string | undefined
  const baseUrl = await getBaseUrl()
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any
    const transactionId = decoded.transactionId
    tokenType = (decoded.type as string).toLowerCase() as
      | "organization"
      | "affiliate"
    if (decoded.role) {
      tokenRole = decoded.role.toLowerCase() as "owner" | "team"
    }
    orgIds = decoded.orgIds || []
    activeOrgId = decoded.activeOrgId
    orgId = decoded.orgId || decoded.organizationId
    const sessionPayload: SessionPayload = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      role: decoded.role,
      orgIds: decoded.orgIds || [],
      activeOrgId: decoded.activeOrgId || undefined,
      orgId: decoded.orgId || decoded.organizationId || undefined,
    }
    if (tokenRole === "team" && tokenType === "organization") {
      sessionPayload.orgId = orgId
    } else if (tokenType === "organization") {
      sessionPayload.orgIds = orgIds
      sessionPayload.activeOrgId = activeOrgId
    } else {
      sessionPayload.orgId = orgId
    }
    if (mode === "signup") {
      if (tokenRole === "team" && tokenType === "organization") {
        const teamAccRecord = await db.query.teamAccount.findFirst({
          where: (ta, { and, eq }) =>
            and(
              eq(ta.teamId, sessionPayload.id),
              eq(ta.provider, "credentials")
            ),
        })

        if (teamAccRecord) {
          await db
            .update(teamAccount)
            .set({ emailVerified: new Date() })
            .where(eq(teamAccount.id, teamAccRecord.id))
        }
      } else if (tokenType === "organization") {
        const userAccount = await db.query.account.findFirst({
          where: (a, { and, eq }) =>
            and(eq(a.userId, sessionPayload.id), eq(a.provider, "credentials")),
        })
        if (userAccount) {
          await db
            .update(account)
            .set({ emailVerified: new Date() })
            .where(eq(account.id, userAccount.id))
        }
        if (transactionId) {
          await assignLifetimePurchase(sessionPayload.id, transactionId)
        } else {
          await assignFreeTrialSubscription(sessionPayload.id)
        }
      } else {
        const affiliateAcc = await db.query.affiliateAccount.findFirst({
          where: (aa, { and, eq }) =>
            and(
              eq(aa.affiliateId, sessionPayload.id),
              eq(aa.provider, "credentials")
            ),
        })
        if (affiliateAcc) {
          await db
            .update(affiliateAccount)
            .set({ emailVerified: new Date() })
            .where(eq(affiliateAccount.id, affiliateAcc.id))
        }
      }
    }

    if (mode === "changeEmail") {
      const newEmail = decoded.newEmail
      if (!newEmail) throw new Error("Missing new email in token")
      if (tokenRole === "team" && tokenType === "organization") {
        await db
          .update(team)
          .set({ email: newEmail })
          .where(eq(team.id, decoded.id))
      } else if (tokenType === "organization") {
        await db
          .update(user)
          .set({ email: newEmail })
          .where(eq(user.id, decoded.id))
      } else {
        await db
          .update(affiliate)
          .set({ email: newEmail })
          .where(eq(affiliate.id, decoded.id))
      }

      // overwrite payload with new email
      sessionPayload.email = newEmail
    }

    const cookieStore = await cookies()
    const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: decoded.rememberMe ? "30d" : "1d",
    })

    cookieStore.set({
      name:
        tokenRole === "team" && tokenType === "organization"
          ? `teamToken-${sessionPayload.orgId}`
          : tokenType === "organization"
            ? "organizationToken"
            : `affiliateToken-${sessionPayload.orgId}`,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: decoded.rememberMe ? 30 * 24 * 60 * 60 : undefined,
    })
    const redirectUrl = buildAffiliateUrl({
      path: "email-verified",
      organizationId: sessionPayload.orgId,
      baseUrl,
      partial: true,
    })
    return {
      success: true,
      redirectUrl:
        redirectUrl ||
        (tokenRole === "team" && tokenType === "organization"
          ? `/organization/${sessionPayload.orgId}/teams/email-verified`
          : tokenType === "organization"
            ? "/email-verified"
            : redirectUrl),
      mode,
      tokenType,
      tokenRole,
      orgIds,
      activeOrgId:
        tokenRole === "team" && tokenType === "organization"
          ? sessionPayload.orgId
          : tokenType === "organization"
            ? sessionPayload.activeOrgId
            : sessionPayload.orgId,
    }
  } catch (err) {
    console.error("Verify error:", err)
    const errorUrl = buildAffiliateUrl({
      path: "invalid-token",
      organizationId: orgId,
      baseUrl,
      partial: true,
    })
    return {
      success: false,
      redirectUrl:
        tokenRole === "team" && tokenType === "organization"
          ? `/organization/${orgId}/teams/invalid-token`
          : tokenType === "organization"
            ? "/invalid-token"
            : orgId
              ? errorUrl
              : `affiliate/unknown`,
    }
  }
}
