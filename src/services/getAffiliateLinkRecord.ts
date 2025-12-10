import { getDB } from "@/db/drizzle"

export const getAffiliateLinkRecord = async (code: string) => {
  const db = await getDB()
  const affiliateLinkRecord = await db.query.affiliateLink.findFirst({
    where: (link, { eq }) => eq(link.id, code),
  })

  if (!affiliateLinkRecord) {
    console.warn("❌ Affiliate link not found for code:", code)
    return null
  }

  return affiliateLinkRecord
}
