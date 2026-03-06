import { db } from "@/db/drizzle"
import { affiliateLink } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getOrgIdFromLink(linkId: string | null | undefined) {
  if (!linkId) return null
  const link = await db.query.affiliateLink.findFirst({
    where: eq(affiliateLink.id, linkId),
  })
  return link?.organizationId
}
