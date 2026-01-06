import { db } from "@/db/drizzle"
import { affiliateLink } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redis } from "@/lib/redis"
import { RedisLinkUpdate } from "@/lib/types/redisLinkMetadata"

/**
 * Broadcasts updates to all affiliate links belonging to an organization.
 * Used for both settings updates and subscription/plan changes.
 */
export async function syncOrgDataToRedisLinks(
  orgId: string,
  updates: RedisLinkUpdate
) {
  // 1. Find all links for this org
  const links = await db.query.affiliateLink.findMany({
    where: eq(affiliateLink.organizationId, orgId),
    columns: { id: true },
  })

  if (links.length === 0) return

  // 2. Fetch all current data for these links in one go
  const keys = links.map((l) => `ref:${l.id}`)
  const currentDataStrings = await redis.mget(...keys)

  const pipeline = redis.pipeline()

  links.forEach((link, index) => {
    const rawData = currentDataStrings[index]
    if (!rawData) return // Skip if link somehow isn't in Redis

    try {
      // Parse existing JSON
      const currentObj = JSON.parse(rawData as string)

      // Merge the new updates into the existing object
      const updatedObj = {
        ...currentObj,
        ...updates,
      }

      // 3. Save the merged object back as a String
      pipeline.set(`ref:${link.id}`, JSON.stringify(updatedObj))
    } catch (e) {
      console.error(`Failed to sync link ${link.id}:`, e)
    }
  })

  await pipeline.exec()
  console.log(`✅ Synced ${links.length} JSON links for Org: ${orgId}`)
}
