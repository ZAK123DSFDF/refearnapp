"use server"

import { eq } from "drizzle-orm"
import { getCurrentUser } from "@/lib/server/getCurrentUser"
import { account } from "@/db/schema"
import { getDB } from "@/db/drizzle"

export async function getUserAuthCapabilities() {
  const { id } = await getCurrentUser()
  if (!id) throw { status: 401, toast: "Unauthorized" }
  const db = await getDB()
  const accounts = await db.query.account.findMany({
    where: eq(account.userId, id),
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
