import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  primaryKey,
  unique,
  pgEnum,
  integer,
  jsonb,
  numeric,
  varchar,
  index,
} from "drizzle-orm/pg-core"
import { createId } from "@paralleldrive/cuid2"
import {
  generateAffiliateClickId,
  generateAffiliateCode,
  generateAffiliatePaymentLinkId,
  generateDomainId,
  generateInviteLinkId,
  generateOrganizationId,
  generatePaddleId,
} from "@/util/idGenerators"
import { AuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { DashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"
export const roleEnum = pgEnum("role", ["OWNER", "ADMIN", "TEAM"])
export const accountTypeEnum = pgEnum("account_type", [
  "ORGANIZATION",
  "AFFILIATE",
])
export const paymentProviderEnum = pgEnum("payment_provider", [
  "stripe",
  "paddle",
])
export const referralParamEnum = pgEnum("referral_param_enum", [
  "ref",
  "via",
  "aff",
])
export const payoutProviderEnum = pgEnum("payout_provider", [
  "paypal",
  "wise",
  "payoneer",
])
export const supportTypeEnum = pgEnum("support_type", ["FEEDBACK", "SUPPORT"])
export const purchaseReasonEnum = pgEnum("purchase_reason", [
  "UPGRADE_NO_BILL",
  "UPGRADE_PRORATED",
  "DOWNGRADE_NO_BILL",
  "DOWNGRADE_IMMEDIATE",
  "CONVERT_TO_ONE_TIME",
])
export const planEnum = pgEnum("plan", ["FREE", "PRO", "ULTIMATE"])

export const billingIntervalEnum = pgEnum("billing_interval", [
  "MONTHLY",
  "YEARLY",
])
export const purchaseTierEnum = pgEnum("purchase_tier", ["PRO", "ULTIMATE"])
export const attributionModelEnum = pgEnum("attribution_model", [
  "FIRST_CLICK",
  "LAST_CLICK",
])
export const currencyEnum = pgEnum("currency", [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
])
export const dnsStatusEnum = pgEnum("dns_status", [
  "Pending",
  "Verified",
  "Failed",
])
export const domainTypeEnum = pgEnum("domain_type", [
  "DEFAULT",
  "CUSTOM_DOMAIN",
  "CUSTOM_SUBDOMAIN",
])
export const affiliateInvoiceReasonEnum = pgEnum("affiliate_invoice_reason", [
  "subscription_create",
  "subscription_update",
  "one_time",
  "refund",
  "manual_adjustment",
])
export const providerEnum = pgEnum("provider", ["credentials", "google"])
export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    role: roleEnum("role").default("OWNER").notNull(),
    type: accountTypeEnum("type").default("ORGANIZATION").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("user_created_at_idx").on(table.createdAt)]
)
export const supportMessage = pgTable(
  "support_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: supportTypeEnum("type").notNull(),
    subject: text("subject").notNull(),
    message: text("message").notNull(),
    orgId: text("org_id").references(() => organization.id, {
      onDelete: "set null",
    }),
    isTeam: boolean("is_team").notNull().default(false),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("support_message_type_created_at_idx").on(
      table.type,
      table.createdAt
    ),
    index("support_message_org_id_created_at_idx").on(
      table.orgId,
      table.createdAt
    ),
  ]
)
export const team = pgTable(
  "team",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    role: roleEnum("role").default("TEAM").notNull(),
    type: accountTypeEnum("type").default("ORGANIZATION").notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    unique("org_team_email_unique").on(table.organizationId, table.email),
    index("team_email_created_at_idx").on(table.email, table.createdAt),
    index("team_name_created_at_idx").on(table.name, table.createdAt),
    index("team_created_at_idx").on(table.createdAt),
  ]
)
export const teamAccount = pgTable(
  "team_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    emailVerified: timestamp("email_verified"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("team_account_team_id_created_at_idx").on(
      table.teamId,
      table.createdAt
    ),
    index("team_account_created_at_idx").on(table.createdAt),
  ]
)
export const account = pgTable(
  "account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    emailVerified: timestamp("email_verified"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("account_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("account_created_at_idx").on(table.createdAt),
  ]
)
export const subscription = pgTable(
  "subscription",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generatePaddleId("sub")),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    plan: planEnum("plan").notNull().default("FREE"),
    billingInterval: billingIntervalEnum("billing_interval"),
    currency: text("currency").default("USD"),
    price: numeric("price", { precision: 10, scale: 2 }),
    priceId: text("price_id"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    subscriptionChangeAt: timestamp("subscription_change_at", {
      withTimezone: true,
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("subscription_user_id_created_at_idx").on(
      table.userId,
      table.createdAt
    ),
    index("subscription_created_at_idx").on(table.createdAt),
  ]
)
export const purchase = pgTable(
  "purchase",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generatePaddleId("pur")),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    tier: purchaseTierEnum("tier").notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    priceId: text("price_id"),
    isActive: boolean("is_active").default(true),
    reason: purchaseReasonEnum("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    index("purchase_user_id_created_at_idx").on(table.userId, table.createdAt),
    index("purchase_created_at_idx").on(table.createdAt),
  ]
)
// ORGANIZATION SCHEMA
export const organization = pgTable(
  "organization",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateOrganizationId()),
    name: text("name").notNull(),
    websiteUrl: text("website_name").notNull(),
    logoUrl: text("logo_url"),
    openGraphUrl: text("open_graph_url"),
    description: text("description"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    referralParam: referralParamEnum("referral_param").default("ref"),
    cookieLifetimeValue: integer("cookie_lifetime_value").default(30),
    cookieLifetimeUnit: text("cookie_lifetime_unit").default("day"),
    commissionType: text("commission_type").default("percentage"),
    commissionValue: numeric("commission_value", {
      precision: 10,
      scale: 2,
    }).default("0.00"),
    commissionDurationValue: integer("commission_duration_value").default(1),
    commissionDurationUnit: text("commission_duration_unit").default("day"),
    attributionModel: attributionModelEnum("attribution_model")
      .notNull()
      .default("LAST_CLICK"),
    currency: currencyEnum("currency").notNull().default("USD"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_user_id_created_at_idx").on(
      table.userId,
      table.createdAt
    ),
    index("organization_created_at_idx").on(table.createdAt),
  ]
)
export const websiteDomain = pgTable(
  "website_domain",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateDomainId()),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    domainName: text("domain_name").notNull().unique(),
    type: domainTypeEnum("type").notNull().default("DEFAULT"),
    isPrimary: boolean("is_primary").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false),
    isRedirect: boolean("is_redirect").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    dnsStatus: dnsStatusEnum("dns_status").notNull().default("Pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("website_domain_org_id_created_at_idx").on(
      table.orgId,
      table.createdAt
    ),
    index("website_domain_created_at_idx").on(table.createdAt),
  ]
)
export const organizationStripeAccount = pgTable(
  "organization_stripe_account",
  {
    stripeAccountId: text("stripe_account_id").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_stripe_account_org_id_created_at_idx").on(
      table.orgId,
      table.createdAt
    ),
    index("organization_stripe_account_created_at_idx").on(table.createdAt),
  ]
)
export const organizationPaddleAccount = pgTable(
  "organization_paddle_account",
  {
    webhookPublicKey: text("webhook_public_key").primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_paddle_account_org_id_created_at_idx").on(
      table.orgId,
      table.createdAt
    ),
    index("organization_paddle_account_created_at_idx").on(table.createdAt),
  ]
)
export const payoutReference = pgTable(
  "payout_reference",
  {
    refId: varchar("ref_id", { length: 12 }).primaryKey(),
    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliate.id, { onDelete: "cascade" }),
    isUnpaid: boolean("is_unpaid").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("payout_reference_org_id_created_at_idx").on(
      table.orgId,
      table.createdAt
    ),
    index("payout_reference_affiliate_id_created_at_idx").on(
      table.affiliateId,
      table.createdAt
    ),
    index("payout_reference_created_at_idx").on(table.createdAt),
  ]
)
export const payoutReferencePeriods = pgTable(
  "payout_reference_periods",
  {
    refId: varchar("ref_id", { length: 12 })
      .notNull()
      .references(() => payoutReference.refId, { onDelete: "cascade" }),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
  },
  (t) => [primaryKey({ columns: [t.refId, t.month, t.year] })]
)
export const affiliate = pgTable(
  "affiliate",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    type: accountTypeEnum("type").default("AFFILIATE").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  },
  (table) => [
    unique("affiliate_org_email_unique").on(table.organizationId, table.email),
    index("affiliate_email_created_at_idx").on(table.email, table.createdAt),
    index("affiliate_name_created_at_idx").on(table.name, table.createdAt),
    index("affiliate_created_at_idx").on(table.createdAt),
  ]
)
export const affiliateAccount = pgTable(
  "affiliate_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliate.id, { onDelete: "cascade" }),
    provider: providerEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    emailVerified: timestamp("email_verified"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("affiliate_account_affiliate_id_created_at_idx").on(
      table.affiliateId,
      table.createdAt
    ),
    index("affiliate_account_created_at_idx").on(table.createdAt),
  ]
)
export const affiliatePayoutMethod = pgTable(
  "affiliate_payout_method",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliate.id, { onDelete: "cascade" }),

    provider: payoutProviderEnum("provider").notNull(),
    accountIdentifier: text("account_identifier").notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("affiliate_payout_method_affiliate_id_created_at_idx").on(
      table.affiliateId,
      table.createdAt
    ),
    index("affiliate_payout_method_created_at_idx").on(table.createdAt),
  ]
)
export const exchangeRate = pgTable(
  "exchange_rate",
  {
    baseCurrency: text("base_currency").notNull(),
    targetCurrency: text("target_currency").notNull(),
    rate: text("rate").notNull(),
    fetchedAt: timestamp("fetched_at").notNull(),
  },
  (t) => [primaryKey({ columns: [t.baseCurrency, t.targetCurrency] })]
)
export const affiliateLink = pgTable(
  "affiliate_link",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateAffiliateCode()),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    affiliateId: uuid("affiliate_id")
      .notNull()
      .references(() => affiliate.id, { onDelete: "cascade" }),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("affiliate_link_affiliate_id_created_at_idx").on(
      table.affiliateId,
      table.createdAt
    ),
    index("affiliate_link_organization_id_created_at_idx").on(
      table.organizationId,
      table.createdAt
    ),
    index("affiliate_link_created_at_idx").on(table.createdAt),
  ]
)
export const affiliateClick = pgTable(
  "affiliate_click",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateAffiliateClickId()),
    affiliateLinkId: text("affiliate_link_id")
      .notNull()
      .references(() => affiliateLink.id, { onDelete: "cascade" }),
    clickCount: integer("click_count").default(1),
    referrer: text("referrer").default("unknown").notNull(),
    deviceType: text("device_type"),
    browser: text("browser"),
    os: text("os"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("affiliate_click_affiliate_link_id_created_at_idx").on(
      table.affiliateLinkId,
      table.createdAt
    ),
    index("affiliate_click_created_at_idx").on(table.createdAt),
  ]
)
export const affiliateInvoice = pgTable(
  "affiliate_invoice",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => generateAffiliatePaymentLinkId()),
    paymentProvider: paymentProviderEnum("payment_provider").notNull(),
    transactionId: text("transaction_id"),
    subscriptionId: text("subscription_id"),
    customerId: text("customer_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: currencyEnum("currency").notNull(),
    rawAmount: numeric("raw_amount", { precision: 10, scale: 2 }).default("0"),
    rawCurrency: text("raw_currency").default("USD"),
    commission: numeric("commission", { precision: 10, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    affiliateLinkId: text("affiliate_link_id")
      .notNull()
      .references(() => affiliateLink.id, { onDelete: "cascade" }),
    unpaidAmount: numeric("unpaid_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    reason: affiliateInvoiceReasonEnum("reason").notNull().default("one_time"),
    refundedAt: timestamp("refunded_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("affiliate_invoice_affiliate_link_id_created_at_idx").on(
      table.affiliateLinkId,
      table.createdAt
    ),
    index("affiliate_invoice_transaction_id_idx").on(table.transactionId),
    index("affiliate_invoice_created_at_idx").on(table.createdAt),
  ]
)
export const subscriptionExpiration = pgTable(
  "subscription_expiration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subscriptionId: text("subscription_id").notNull().unique(),
    expirationDate: timestamp("expiration_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("subscription_expiration_created_at_idx").on(table.createdAt),
  ]
)
export const invitation = pgTable(
  "invitation",
  {
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
    accepted: boolean("accepted").default(false).notNull(),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("invitation_created_at_idx").on(table.createdAt)]
)

export const organizationDashboardCustomization = pgTable(
  "organization_dashboard_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id),
    dashboard: jsonb("dashboard").$type<DashboardCustomization>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_dashboard_customization_created_at_idx").on(
      table.createdAt
    ),
  ]
)
export const organizationAuthCustomization = pgTable(
  "organization_auth_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id),
    auth: jsonb("auth").$type<AuthCustomization>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_auth_customization_created_at_idx").on(table.createdAt),
  ]
)
