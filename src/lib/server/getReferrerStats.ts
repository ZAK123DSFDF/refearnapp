import { affiliateClick } from "@/db/schema"
import { inArray, sql } from "drizzle-orm"
import { buildWhereWithDate } from "@/util/BuildWhereWithDate"
import { getDB } from "@/db/drizzle"

export async function getReferrerStats(
  linkIds: string[],
  year?: number,
  month?: number
) {
  const db = await getDB()
  return db
    .select({
      referrer: affiliateClick.referrer,
      clicks: sql<number>`COUNT(*)`.mapWith(Number),
    })
    .from(affiliateClick)
    .where(
      buildWhereWithDate(
        [inArray(affiliateClick.affiliateLinkId, linkIds)],
        affiliateClick,
        year,
        month
      )
    )
    .groupBy(affiliateClick.referrer)
}
