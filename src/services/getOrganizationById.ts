import { getDB } from "@/db/drizzle"

export async function getOrganizationById(orgId: string) {
  const db = await getDB()
  const organizationRecord = await db.query.organization.findFirst({
    where: (org, { eq }) => eq(org.id, orgId),
  })

  if (!organizationRecord) {
    console.warn("❌ No organization found for id:", orgId)
    return null
  }

  return organizationRecord
}
