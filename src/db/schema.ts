import {
  sqliteTable,
  text,
  integer,
  unique,
  primaryKey,
} from "drizzle-orm/sqlite-core"
import {
  generateAffiliateClickId,
  generateAffiliateCode,
  generateAffiliatePaymentLinkId,
  generateDomainId,
  generateInviteLinkId,
  generateOrganizationId,
  generatePaddleId,
} from "@/util/idGenerators"
import { createId } from "@paralleldrive/cuid2"
import { DashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"
import { AuthCustomization } from "@/customization/Auth/defaultAuthCustomization"

export const roleValues = ["OWNER", "ADMIN", "TEAM"] as const
export const accountTypeValues = ["ORGANIZATION", "AFFILIATE"] as const
export const referralParamValues = ["ref", "via", "aff"] as const
export const attributionModelValues = ["FIRST_CLICK", "LAST_CLICK"] as const
export const currencyValues = ["USD", "EUR", "GBP", "CAD", "AUD"] as const
export const providerValues = ["credentials", "google"] as const
export const planValues = ["FREE", "PRO", "ULTIMATE"] as const
export const billingIntervalValues = ["MONTHLY", "YEARLY"] as const
export const purchaseTierValues = ["PRO", "ULTIMATE"] as const
export const purchaseReasonValues = [
  "UPGRADE_NO_BILL",
  "UPGRADE_PRORATED",
  "DOWNGRADE_NO_BILL",
  "DOWNGRADE_IMMEDIATE",
  "CONVERT_TO_ONE_TIME",
] as const
export const payoutProviderValues = ["paypal", "wise", "payoneer"] as const
export const paymentProviderValues = ["stripe", "paddle"] as const
export const affiliateInvoiceReasonValues = [
  "subscription_create",
  "subscription_update",
  "one_time",
  "refund",
  "manual_adjustment",
] as const
export const domainTypeValues = ["DEFAULT", "CUSTOM"] as const
const generateUuid = () => crypto.randomUUID()

// --- Tables ---

export const user = sqliteTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUuid()),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: roleValues }).default("OWNER").notNull(),
  type: text("type", { enum: accountTypeValues })
    .default("ORGANIZATION")
    .notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const organization = sqliteTable("organization", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateOrganizationId()),
  name: text("name").notNull(),
  websiteUrl: text("website_name").notNull(),
  logoUrl: text("logo_url"),
  openGraphUrl: text("open_graph_url"),
  description: text("description"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  referralParam: text("referral_param", { enum: referralParamValues }).default(
    "ref"
  ),
  cookieLifetimeValue: integer("cookie_lifetime_value").default(30),
  cookieLifetimeUnit: text("cookie_lifetime_unit").default("day"),
  commissionType: text("commission_type").default("percentage"),
  commissionValue: text("commission_value").default("0"),
  commissionDurationValue: integer("commission_duration_value").default(1),
  commissionDurationUnit: text("commission_duration_unit").default("day"),
  attributionModel: text("attribution_model", { enum: attributionModelValues })
    .notNull()
    .default("LAST_CLICK"),
  currency: text("currency", { enum: currencyValues }).notNull().default("USD"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})

export const team = sqliteTable(
  "team",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUuid()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: text("role", { enum: roleValues }).default("TEAM").notNull(),
    type: text("type", { enum: accountTypeValues })
      .default("ORGANIZATION")
      .notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [
    unique("org_team_email_unique").on(table.email, table.organizationId),
  ]
)
export const teamAccount = sqliteTable("team_account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUuid()),
  teamId: text("team_id")
    .notNull()
    .references(() => team.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: providerValues }).notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const account = sqliteTable("account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUuid()),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: providerValues }).notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const subscription = sqliteTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generatePaddleId("sub")),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  plan: text("plan", { enum: planValues }).notNull().default("FREE"),
  billingInterval: text("billing_interval", { enum: billingIntervalValues }),
  currency: text("currency").default("USD"),
  price: text("price").default("0"),
  priceId: text("price_id"),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  subscriptionChangeAt: integer("subscription_change_at", {
    mode: "timestamp",
  }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
})
export const purchase = sqliteTable("purchase", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generatePaddleId("pur")),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  tier: text("tier", { enum: purchaseTierValues }).notNull(),
  price: text("price").notNull().default("0"),
  currency: text("currency").default("USD"),
  priceId: text("price_id"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  reason: text("reason", { enum: purchaseReasonValues }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date()
  ),
})
export const affiliate = sqliteTable(
  "affiliate",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateUuid()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    type: text("type", { enum: accountTypeValues })
      .default("AFFILIATE")
      .notNull(),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  },
  (table) => [unique("org_email_unique").on(table.email, table.organizationId)]
)
export const affiliateAccount = sqliteTable("affiliate_account", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateUuid()),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: providerValues }).notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  emailVerified: integer("email_verified", { mode: "timestamp" }),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const websiteDomain = sqliteTable("website_domain", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateDomainId()),
  orgId: text("org_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  domainName: text("domain_name").notNull().unique(),
  type: text("type", { enum: domainTypeValues }).notNull().default("DEFAULT"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(false),
  isRedirect: integer("is_redirect", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const organizationStripeAccount = sqliteTable(
  "organization_stripe_account",
  {
    stripeAccountId: text("stripe_account_id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  }
)
export const organizationPaddleAccount = sqliteTable(
  "organization_paddle_account",
  {
    webhookPublicKey: text("webhook_public_key").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  }
)
export const payoutReference = sqliteTable("payout_reference", {
  refId: text("ref_id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),
  isUnpaid: integer("is_unpaid", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const payoutReferencePeriods = sqliteTable(
  "payout_reference_periods",
  {
    refId: text("ref_id")
      .notNull()
      .references(() => payoutReference.refId, { onDelete: "cascade" }),

    month: integer("month").notNull(),
    year: integer("year").notNull(),
  },
  (table) => [primaryKey({ columns: [table.refId, table.month, table.year] })]
)
export const affiliatePayoutMethod = sqliteTable("affiliate_payout_method", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),
  provider: text("provider", { enum: payoutProviderValues }).notNull(),
  accountIdentifier: text("account_identifier").notNull(),
  isDefault: integer("is_default", { mode: "boolean" })
    .notNull()
    .default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const exchangeRate = sqliteTable(
  "exchange_rate",
  {
    baseCurrency: text("base_currency").notNull(),
    targetCurrency: text("target_currency").notNull(),
    rate: text("rate").notNull(),

    fetchedAt: integer("fetched_at", { mode: "timestamp" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.baseCurrency, t.targetCurrency] })]
)
export const affiliateLink = sqliteTable("affiliate_link", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateAffiliateCode()),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  affiliateId: text("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
})
export const affiliateClick = sqliteTable("affiliate_click", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateAffiliateClickId()),
  affiliateLinkId: text("affiliate_link_id")
    .notNull()
    .references(() => affiliateLink.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  referrer: text("referrer").notNull().default("unknown"),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const affiliateInvoice = sqliteTable("affiliate_invoice", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateAffiliatePaymentLinkId()),
  paymentProvider: text("payment_provider", {
    enum: paymentProviderValues,
  }).notNull(),
  subscriptionId: text("subscription_id"),
  customerId: text("customer_id").notNull(),
  amount: text("amount").notNull(),
  currency: text("currency", { enum: currencyValues }).notNull(),
  rawAmount: text("raw_amount").default("0"),
  rawCurrency: text("raw_currency").default("USD"),
  commission: text("commission").notNull(),
  paidAmount: text("paid_amount").default("0").notNull(),
  affiliateLinkId: text("affiliate_link_id")
    .notNull()
    .references(() => affiliateLink.id, { onDelete: "cascade" }),
  unpaidAmount: text("unpaid_amount").default("0").notNull(),
  reason: text("reason", { enum: affiliateInvoiceReasonValues })
    .notNull()
    .default("one_time"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const subscriptionExpiration = sqliteTable("subscription_expiration", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  subscriptionId: text("subscription_id").notNull().unique(),
  expirationDate: integer("expiration_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const invitation = sqliteTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateInviteLinkId()),
  email: text("email").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  title: text("title"),
  body: text("body"),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => createId()),
  accepted: integer("accepted", { mode: "boolean" }).notNull().default(false),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
})
export const organizationDashboardCustomization = sqliteTable(
  "organization_dashboard_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),

    dashboard: text("dashboard", {
      mode: "json",
    }).$type<DashboardCustomization>(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  }
)
export const organizationAuthCustomization = sqliteTable(
  "organization_auth_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),

    auth: text("auth", { mode: "json" }).$type<AuthCustomization>(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),
  }
)
export const tables = {
  user,
  organization,
  team,
  teamAccount,
  account,
  subscription,
  purchase,
  affiliate,
  affiliateAccount,
  websiteDomain,
  organizationStripeAccount,
  organizationPaddleAccount,
  payoutReference,
  payoutReferencePeriods,
  affiliatePayoutMethod,
  exchangeRate,
  affiliateLink,
  affiliateClick,
  affiliateInvoice,
  subscriptionExpiration,
  invitation,
  organizationDashboardCustomization,
  organizationAuthCustomization,
}
