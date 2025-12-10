// lib/server/getAffiliateAuth.ts
"use server"

import { eq } from "drizzle-orm"

import { affiliateAccount } from "@/db/schema"
import { getCurrentAffiliateUser } from "@/lib/server/getCurrrentAffiliateUser"
import { getDB } from "@/db/drizzle"

export async function getAffiliateAuthCapabilities(orgId: string) {
  const { id } = await getCurrentAffiliateUser(orgId)
  if (!id) throw { status: 401, toast: "Unauthorized" }
  const db = await getDB()
  const accounts = await db.query.affiliateAccount.findMany({
    where: eq(affiliateAccount.affiliateId, id),
  })

  const hasCredentials = accounts.some((a) => a.provider === "credentials")
  const hasOAuth = accounts.some((a) => a.provider !== "credentials")

  return {
    userId: id,
    hasCredentials,
    hasOAuth,
    canChangePassword: hasCredentials,
    canChangeEmail: hasCredentials && !hasOAuth,
  }
}
