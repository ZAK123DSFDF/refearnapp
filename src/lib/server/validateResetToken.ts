// lib/server/validateResetToken.ts
"use server"

import jwt from "jsonwebtoken"
import { user, affiliate, team } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

type ValidateResetTokenProps = {
  token: string
  tokenType: "affiliate" | "organization"
}

export const validateResetToken = async ({
  token,
  tokenType,
}: ValidateResetTokenProps) => {
  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any

    const sessionPayload = {
      id: decoded.id,
      email: decoded.email,
      type: decoded.type,
      role: decoded.role,
      orgId: decoded.organizationId || decoded.orgId,
    }
    const db = await getDB()
    // Make sure the account actually exists
    if (tokenType === "organization") {
      if (sessionPayload.role === "TEAM") {
        const existingTeam = await db.query.team.findFirst({
          where: eq(team.id, sessionPayload.id),
        })
        if (!existingTeam) return null
      } else {
        const existingUser = await db.query.user.findFirst({
          where: eq(user.id, sessionPayload.id),
        })
        if (!existingUser) return null
      }
    }

    if (tokenType === "affiliate") {
      const existingAffiliate = await db.query.affiliate.findFirst({
        where: eq(affiliate.id, sessionPayload.id),
      })
      if (!existingAffiliate) return null
    }

    return sessionPayload
  } catch (err) {
    console.error("Reset token validation failed:", err)
    return null
  }
}
