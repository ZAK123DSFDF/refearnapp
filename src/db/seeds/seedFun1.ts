import { db } from "@/db/drizzle"
import {
  user,
  organization,
  affiliate,
  affiliateLink,
  affiliateClick,
  affiliateInvoice,
  organizationAuthCustomization,
  organizationDashboardCustomization,
  account,
  affiliateAccount,
  websiteDomain,
  team,
  teamAccount,
  affiliatePayoutMethod,
  purchase,
  promotionCodes,
  referrals,
} from "@/db/schema"
import {
  account_seed,
  affiliate_account_seed,
  affiliate_click_seed,
  affiliate_invoice_seed,
  affiliate_link_seed,
  affiliate_payout_method_seed,
  affiliate_seed,
  organization_auth_customization_seed,
  organization_dashboard_customization_seed,
  organization_seed,
  promotion_codes_seed,
  purchase_seed,
  referrals_seed,
  team_account_seed,
  team_seed,
  user_seed,
  websiteDomain_seed,
} from "@/db/seeds/databaseSeed"
import { redis } from "@/lib/redis"
async function seedFun() {
  await db.transaction(async (tx) => {
    // 1️⃣ Core identities
    await tx.insert(user).values(user_seed)
    await tx.insert(account).values(account_seed)

    // 2️⃣ Organization (depends on user)
    await tx.insert(organization).values(organization_seed)
    await tx.insert(websiteDomain).values(websiteDomain_seed)

    // 3️⃣ Affiliates
    await tx.insert(affiliate).values(affiliate_seed)
    await tx.insert(affiliateAccount).values(affiliate_account_seed)
    await tx.insert(affiliatePayoutMethod).values(affiliate_payout_method_seed)

    // 4️⃣ Affiliate activity
    await tx.insert(affiliateLink).values(affiliate_link_seed)
    await tx.insert(affiliateClick).values(affiliate_click_seed)
    await tx.insert(affiliateInvoice).values(affiliate_invoice_seed)
    await tx.insert(promotionCodes).values(promotion_codes_seed)
    await tx.insert(referrals).values(referrals_seed)
    // 5️⃣ Subscription & team
    await tx.insert(purchase).values(purchase_seed)
    await tx.insert(team).values(team_seed)
    await tx.insert(teamAccount).values(team_account_seed)

    // 6️⃣ Customizations
    await tx
      .insert(organizationAuthCustomization)
      .values(organization_auth_customization_seed)

    await tx
      .insert(organizationDashboardCustomization)
      .values(organization_dashboard_customization_seed)
  })
  console.log("📡 Syncing Affiliate Links to Redis...")

  const org = organization_seed[0]
  const activePurchase = purchase_seed[0]
  const planType = activePurchase ? activePurchase.tier : "FREE"
  const paymentType = activePurchase ? "ONE-TIME" : "SUBSCRIPTION"

  // 1. Create a Pipeline
  const pipeline = redis.pipeline()

  affiliate_link_seed.forEach((link) => {
    const domain = org.websiteUrl.replace(/^https?:\/\//, "")

    const redisData = {
      orgId: org.id,
      ownerId: org.userId,
      planType: String(planType),
      paymentType: String(paymentType),
      expiresAt: "null",
      name: org.name,
      websiteUrl: domain,
      referralParam: org.referralParam || "ref",
      cookieLifetimeValue: String(org.cookieLifetimeValue),
      cookieLifetimeUnit: org.cookieLifetimeUnit || "day",
      commissionType: org.commissionType || "percentage",
      commissionValue: String(org.commissionValue),
      commissionDurationValue: String(org.commissionDurationValue),
      commissionDurationUnit: org.commissionDurationUnit || "day",
      attributionModel: org.attributionModel,
      currency: org.currency,
    }

    // 2. Use .set() with stringify instead of .hset()
    // This counts as 1 command regardless of how many fields are inside
    pipeline.set(`ref:${link.id}`, JSON.stringify(redisData))
  })

  // 3. Execute the pipeline
  await pipeline.exec()

  console.log(`✅ Synced ${affiliate_link_seed.length} links (1 command each)`)
}

seedFun()
  .then(() => {
    console.log("✅ Auto-seed completed")
    process.exit(0)
  })
  .catch((err) => {
    console.error("❌ Auto-seed failed", err)
    process.exit(1)
  })
