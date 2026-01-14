import { db } from "@/db/drizzle"
import { redis } from "@/lib/redis"
import { eq, inArray } from "drizzle-orm"
import {
  organization,
  affiliateLink,
  affiliateInvoice,
  subscriptionExpiration,
  user,
  organizationAuthCustomization,
  organizationDashboardCustomization,
} from "@/db/schema"

async function smartReset() {
  const isProd = process.env.MODE === "prod"
  const TEST_ORG_ID = "tp7JLBb5"
  const TEST_USER_ID = "29022934-eb52-49af-aca4-b6ed553c89dd"

  try {
    if (isProd) {
      console.log("🛡️ PRODUCTION MODE: Selective Cleanup (User & Org)...")

      // 1. Resolve Foreign Key Dependencies (Subscription Expirations)
      const links = await db
        .select({ id: affiliateLink.id })
        .from(affiliateLink)
        .where(eq(affiliateLink.organizationId, TEST_ORG_ID))

      const linkIds = links.map((l) => l.id)

      if (linkIds.length > 0) {
        const invoices = await db
          .select({ subId: affiliateInvoice.subscriptionId })
          .from(affiliateInvoice)
          .where(inArray(affiliateInvoice.affiliateLinkId, linkIds))

        const subIds = invoices
          .map((i) => i.subId)
          .filter((id): id is string => !!id)

        if (subIds.length > 0) {
          await db
            .delete(subscriptionExpiration)
            .where(inArray(subscriptionExpiration.subscriptionId, subIds))
        }

        // 2. Clear Redis link caches
        const pipeline = redis.pipeline()
        linkIds.forEach((id) => pipeline.del(`ref:${id}`))
        await pipeline.exec()
        console.log(`🧹 Redis: Cleared ${linkIds.length} link keys`)
      }

      // 3. Delete Customizations (Must happen before Org deletion)
      await db
        .delete(organizationAuthCustomization)
        .where(eq(organizationAuthCustomization.id, TEST_ORG_ID))
      await db
        .delete(organizationDashboardCustomization)
        .where(eq(organizationDashboardCustomization.id, TEST_ORG_ID))

      // 4. Delete the Organization
      // This will cascade and delete: affiliates, affiliate_links, teams, website_domains
      await db.delete(organization).where(eq(organization.id, TEST_ORG_ID))

      // 5. Delete the User
      // This will cascade and delete: accounts, subscriptions, purchases
      await db.delete(user).where(eq(user.id, TEST_USER_ID))

      console.log(
        "✅ Production selective reset complete (Support messages preserved)"
      )
    } else {
      console.log("🧨 DEVELOPMENT MODE: Full Destructive Reset...")

      // Complete wipe for Dev
      await db.execute(`DROP SCHEMA IF EXISTS drizzle CASCADE`)
      await db.execute(`DROP SCHEMA IF EXISTS public CASCADE`)
      await db.execute(`CREATE SCHEMA public`)

      await redis.flushdb()
      console.log("✅ Full Dev reset complete")
    }
  } catch (error) {
    console.error("❌ Reset failed:", error)
    process.exit(1)
  }
}

smartReset().then(() => process.exit(0))
