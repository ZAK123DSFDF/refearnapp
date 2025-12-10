import { and, eq, gt } from "drizzle-orm"
import { invitation } from "@/db/schema"
import { getDB } from "@/db/drizzle"

export async function getTeamValidation(teamToken?: string) {
  if (!teamToken) return null
  const db = await getDB()
  return db.query.invitation.findFirst({
    where: and(
      eq(invitation.token, teamToken),
      eq(invitation.accepted, false),
      gt(invitation.expiresAt, new Date())
    ),
  })
}
