import { db } from "@/db/drizzle"
import { affiliateLink } from "@/db/schema"
import { eq } from "drizzle-orm"
import { redis } from "@/lib/redis"

/**
 * Broadcasts updates to all affiliate links belonging to an organization.
 * Used for both settings updates and subscription/plan changes.
 */
export async function syncOrgDataToRedisLinks(
  orgId: string,
  updates: Record<string, string | number | null>
) {
  // 1. Find all links for this org
  const links = await db.query.affiliateLink.findMany({
    where: eq(affiliateLink.organizationId, orgId),
    columns: { id: true },
  })

  if (links.length === 0) return

  // 2. Prepare updates (convert nulls to "null" strings for Worker safety)
  const processedUpdates: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(updates)) {
    processedUpdates[k] = v === null ? "null" : v
  }

  // 3. One Pipeline trip for all links
  const pipeline = redis.pipeline()
  for (const link of links) {
    pipeline.hset(`ref:${link.id}`, processedUpdates)
  }

  await pipeline.exec()
  console.log(`✅ Synced ${links.length} links for Org: ${orgId}`)
}
