import { and, eq } from "drizzle-orm"
import { websiteDomain } from "@/db/schema"
import { getDB } from "@/db/drizzle"
export const getOrgBaseUrl = async (orgId: string) => {
  const db = await getDB()
  const activeDomain = await db.query.websiteDomain.findFirst({
    where: and(
      eq(websiteDomain.orgId, orgId),
      eq(websiteDomain.isActive, true)
    ),
  })

  if (!activeDomain) {
    throw {
      status: 500,
      error: "domain not found for organization",
      toast: "domain not found for organization",
    }
  }

  return `https://${activeDomain.domainName}`
}
