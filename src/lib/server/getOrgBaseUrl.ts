import { db } from "@/db/drizzle"
import { and, eq } from "drizzle-orm"
import { websiteDomain } from "@/db/schema"
export const getOrgBaseUrl = async (orgId: string) => {
  const activeDomain = await db.query.websiteDomain.findFirst({
    where: and(
      eq(websiteDomain.orgId, orgId),
      eq(websiteDomain.isPrimary, true),
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
