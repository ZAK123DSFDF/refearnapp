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
  const links = await db.query.affiliateLink.findMany({
    where: eq(affiliateLink.organizationId, orgId),
    columns: { id: true },
  })

  if (links.length === 0) return

  const keys = links.map((l) => `ref:${l.id}`)
  const currentDataItems = await redis.mget(...keys)

  const pipeline = redis.pipeline()

  links.forEach((link, index) => {
    const rawData = currentDataItems[index]
    if (!rawData) return

    try {
      // ✅ FIX: Upstash mget often auto-parses JSON strings into Objects.
      // We only parse if it's still a string.
      const currentObj =
        typeof rawData === "string" ? JSON.parse(rawData) : rawData

      const updatedObj = {
        ...currentObj,
        ...updates,
      }

      pipeline.set(`ref:${link.id}`, JSON.stringify(updatedObj))
    } catch (e) {
      console.error(`Failed to sync link ${link.id}:`, e)
    }
  })

  await pipeline.exec()
  console.log(`✅ Synced ${links.length} JSON links for Org: ${orgId}`)
}
