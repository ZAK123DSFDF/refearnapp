import { eq } from "drizzle-orm"
import { teamAccount } from "@/db/schema"
import { getCurrentTeam } from "@/lib/server/getCurrentTeam"
import { getDB } from "@/db/drizzle"

export async function getTeamAuthCapabilities(orgId: string) {
  const { id } = await getCurrentTeam(orgId)
  if (!id) throw { status: 401, toast: "Unauthorized" }
  const db = await getDB()
  const accounts = await db.query.teamAccount.findMany({
    where: eq(teamAccount.teamId, id),
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
