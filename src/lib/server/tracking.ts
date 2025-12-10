import { organization, subscription } from "@/db/schema"
import { eq } from "drizzle-orm"
import { convertUsdToCurrency } from "@/util/Currency"
import { getAffiliateTotalEarnings } from "@/lib/server/affiliateInvoice"
import { getDB } from "@/db/drizzle"

const FREE_PLAN_LIMIT_USD = 1000

export async function shouldTrackTransaction(
  userId: string,
  affiliateLinkId: string
): Promise<boolean> {
  const db = await getDB()
  const userSub = await db.query.subscription.findFirst({
    where: eq(subscription.userId, userId),
  })
  if (!userSub) {
    console.warn("⚠️ No subscription found, treating user as FREE plan")
    const userOrg = await db.query.organization.findFirst({
      where: eq(organization.userId, userId),
    })

    const orgCurrency = userOrg?.currency || "USD"
    const limit = await convertUsdToCurrency(FREE_PLAN_LIMIT_USD, orgCurrency)
    const total = await getAffiliateTotalEarnings(affiliateLinkId)

    return total <= limit
  }

  return true
}
