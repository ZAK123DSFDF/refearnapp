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
  subscription,
  team,
  teamAccount,
  affiliatePayoutMethod,
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
  subscription_seed,
  team_account_seed,
  team_seed,
  user_seed,
  websiteDomain_seed,
} from "@/db/seeds/databaseSeed"

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

    // 5️⃣ Subscription & team
    await tx.insert(subscription).values(subscription_seed)
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
