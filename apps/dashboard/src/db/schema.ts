import {
  pgTable,
  text,
  timestamp,
  boolean,
  uuid,
  primaryKey,
  unique,
  integer,
  jsonb,
  numeric,
  varchar,
  index,
  uniqueIndex,
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
// --- 1. CORE AUTH & ACCESS ---
export const ROLES = ["OWNER", "ADMIN", "TEAM"] as const
export type Role = (typeof ROLES)[number]

export const ACCOUNT_TYPES = ["ORGANIZATION", "AFFILIATE"] as const
export type AccountType = (typeof ACCOUNT_TYPES)[number]

export const AUTH_PROVIDERS = ["credentials", "google"] as const
export type AuthProvider = (typeof AUTH_PROVIDERS)[number]

// --- 2. PAYMENT & BILLING ---
export const PAYMENT_PROVIDERS = ["stripe", "paddle"] as const
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number]

export const VALUE_TYPES = ["PERCENTAGE", "FLAT_FEE"] as const
export type ValueType = (typeof VALUE_TYPES)[number]

export const PLANS = ["FREE", "PRO", "ULTIMATE"] as const
export type Plan = (typeof PLANS)[number]

export const BILLING_INTERVALS = ["MONTHLY", "YEARLY"] as const
export type BillingInterval = (typeof BILLING_INTERVALS)[number]

export const PURCHASE_TIERS = ["PRO", "ULTIMATE"] as const
export type PurchaseTier = (typeof PURCHASE_TIERS)[number]

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD"] as const
export type Currency = (typeof CURRENCIES)[number]

export const LICENSE_STATUSES = ["active", "expired", "revoked"] as const
export type LicenseStatus = (typeof LICENSE_STATUSES)[number]

export const BILLING_PROVIDERS = ["paddle", "polar"] as const
export type BillingProvider = (typeof BILLING_PROVIDERS)[number]

// --- 3. AFFILIATE SPECIFIC ---
export const REFERRAL_PARAMS = ["ref", "via", "aff"] as const
export type ReferralParam = (typeof REFERRAL_PARAMS)[number]

export const DURATION_UNITS = ["day", "week", "month", "year"] as const
export type DurationUnit = (typeof DURATION_UNITS)[number]

export const ATTRIBUTION_MODELS = ["FIRST_CLICK", "LAST_CLICK"] as const
export type AttributionModel = (typeof ATTRIBUTION_MODELS)[number]

export const PAYOUT_PROVIDERS = ["paypal", "wise", "payoneer"] as const
export type PayoutProvider = (typeof PAYOUT_PROVIDERS)[number]

export const APPSUMO_STATUSES = ["active", "claimed", "deactivated"] as const
export type AppSumoStatus = (typeof APPSUMO_STATUSES)[number]

export const PROGRAM_TYPES = ["open", "invite_only", "application"] as const
export type ProgramType = (typeof PROGRAM_TYPES)[number]

export const AFFILIATE_STATUSES = [
  "pending",
  "active",
  "rejected",
  "suspended",
] as const
export type AffiliateStatus = (typeof AFFILIATE_STATUSES)[number]

export const PROMOTION_METHODS = [
  "social_media",
  "blog_website",
  "email_marketing",
  "paid_ads",
  "content_creation",
  "offline_networking",
  "other",
] as const
export type PromotionMethod = (typeof PROMOTION_METHODS)[number]

export const COMMISSION_STATUSES = [
  "pending",
  "approved",
  "flagged",
  "rejected",
  "paid",
] as const
export type CommissionStatus = (typeof COMMISSION_STATUSES)[number]

export const AFFILIATE_INVOICE_REASONS = [
  "subscription_create",
  "subscription_update",
  "one_time",
  "refund",
  "manual_adjustment",
  "placeholder_from_charge",
  "trial_start",
] as const
export type AffiliateInvoiceReason = (typeof AFFILIATE_INVOICE_REASONS)[number]

// --- 4. DOMAINS & DNS ---
export const DNS_STATUSES = ["Pending", "Verified", "Failed"] as const
export type DnsStatus = (typeof DNS_STATUSES)[number]

export const DOMAIN_TYPES = [
  "DEFAULT",
  "CUSTOM_DOMAIN",
  "CUSTOM_SUBDOMAIN",
] as const
export type DomainType = (typeof DOMAIN_TYPES)[number]

// --- 5. SYSTEM & SUPPORT ---
export const SUPPORT_TYPES = ["FEEDBACK", "SUPPORT"] as const
export type SupportType = (typeof SUPPORT_TYPES)[number]

export const PURCHASE_REASONS = [
  "UPGRADE_NO_BILL",
  "UPGRADE_PRORATED",
  "DOWNGRADE_NO_BILL",
  "DOWNGRADE_IMMEDIATE",
  "CONVERT_TO_ONE_TIME",
] as const
export type PurchaseReason = (typeof PURCHASE_REASONS)[number]
export const user = pgTable(
  "user",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    image: text("image"),
    role: text("role").$type<Role>().default("OWNER").notNull(),
    type: text("type").$type<AccountType>().default("ORGANIZATION").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("user_created_at_idx").on(table.createdAt)]
)
export const supportMessage = pgTable(
  "support_message",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: text("type").$type<SupportType>().notNull(),
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
    image: text("image"),
    role: text("role").$type<Role>().default("TEAM").notNull(),
    type: text("type").$type<AccountType>().default("ORGANIZATION").notNull(),
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
    provider: text("provider").$type<AuthProvider>().notNull(),
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
    provider: text("provider").$type<AuthProvider>().notNull(),
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
export const appsumoKeys = pgTable(
  "appsumo_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    key: text("key").notNull().unique(),
    tier: integer("tier").notNull(),
    status: text("status").$type<AppSumoStatus>().default("active").notNull(),
    userId: uuid("user_id").references(() => user.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    redeemedAt: timestamp("redeemed_at"),
  },
  (table) => [
    index("appsumo_keys_key_idx").on(table.key),
    index("appsumo_keys_user_id_idx").on(table.userId),
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
    plan: text("plan").$type<Plan>().notNull().default("FREE"),
    billingInterval: text("billing_interval").$type<BillingInterval>(),
    provider: text("provider").$type<BillingProvider>(),
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
    provider: text("provider").$type<BillingProvider>().notNull().default("polar"),
    providerOrderId: text("provider_order_id"),
    tier: text("tier").$type<PurchaseTier>().notNull(),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").default("USD"),
    priceId: text("price_id"),
    isActive: boolean("is_active").default(true),
    reason: text("reason").$type<PurchaseReason>(),
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
    supportEmail: text("support_email"),
    logoUrl: text("logo_url"),
    openGraphUrl: text("open_graph_url"),
    description: text("description"),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    referralParam: text("referral_param").$type<ReferralParam>().default("ref"),
    cookieLifetimeValue: integer("cookie_lifetime_value").default(30),
    cookieLifetimeUnit: text("cookie_lifetime_unit")
      .$type<DurationUnit>()
      .default("day"),
    commissionType: text("commission_type")
      .$type<ValueType>()
      .default("PERCENTAGE"),
    commissionValue: numeric("commission_value", {
      precision: 10,
      scale: 2,
    }).default("0.00"),
    commissionDurationValue: integer("commission_duration_value").default(1),
    commissionDurationUnit: text("commission_duration_unit").default("day"),
    attributionModel: text("attribution_model")
      .$type<AttributionModel>()
      .notNull()
      .default("LAST_CLICK"),
    currency: text("currency").$type<Currency>().notNull().default("USD"),
    isPrivate: boolean("is_private").notNull().default(false),
    showBranding: boolean("show_branding").default(true).notNull(),
    programType: text("program_type")
      .$type<ProgramType>()
      .notNull()
      .default("open"),
    minimumPayoutThreshold: numeric("minimum_payout_threshold", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("0"),
    askPromotionMethod: boolean("ask_promotion_method")
      .default(false)
      .notNull(),
    askWebsiteUrl: boolean("ask_website_url").default(false).notNull(),
    askSocialHandle: boolean("ask_social_handle").default(false).notNull(),
    askPromotionDetails: boolean("ask_promotion_details")
      .default(false)
      .notNull(),
    showTos: boolean("show_tos").default(false).notNull(),
    tosUrl: text("tos_url"),
    privacyPolicyUrl: text("privacy_policy_url"),
    holdPeriodDays: integer("hold_period_days").notNull().default(45),
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
    type: text("type").$type<DomainType>().notNull().default("DEFAULT"),
    isPrimary: boolean("is_primary").notNull().default(false),
    isActive: boolean("is_active").notNull().default(false),
    isRedirect: boolean("is_redirect").notNull().default(false),
    isVerified: boolean("is_verified").notNull().default(false),
    dnsStatus: text("dns_status")
      .$type<DnsStatus>()
      .notNull()
      .default("Pending"),
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
    id: uuid("id").primaryKey().defaultRandom(),
    stripeAccountId: text("stripe_account_id").notNull(),

    orgId: text("org_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),

    email: text("email"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("stripe_org_unique_idx").on(table.stripeAccountId, table.orgId),
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
    image: text("image"),
    type: text("type").$type<AccountType>().default("AFFILIATE").notNull(),
    status: text("status").$type<AffiliateStatus>().notNull().default("active"),
    promotionMethods: text("promotion_methods")
      .$type<PromotionMethod[]>()
      .array(),
    promotionDetails: text("promotion_details"),
    websiteUrl: text("website_url"),
    socialHandle: text("social_handle"),
    acceptedTosAt: timestamp("accepted_tos_at"),
    appliedAt: timestamp("applied_at"),
    reviewedAt: timestamp("reviewed_at"),
    signupIp: text("signup_ip"),
    onboardingCompleted: boolean("onboarding_completed")
      .default(false)
      .notNull(),
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
    provider: text("provider").$type<AuthProvider>().notNull(),
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

    provider: text("provider").$type<PayoutProvider>().notNull(),
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
      .references(() => affiliateLink.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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
    paymentProvider: text("payment_provider")
      .$type<PaymentProvider>()
      .notNull(),
    transactionId: text("transaction_id"),
    subscriptionId: text("subscription_id"),
    customerId: text("customer_id").notNull(),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: text("currency").$type<Currency>().notNull(),
    rawAmount: numeric("raw_amount", { precision: 10, scale: 2 }).default("0"),
    rawCurrency: text("raw_currency").default("USD"),
    commission: numeric("commission", { precision: 10, scale: 2 }).notNull(),
    paidAmount: numeric("paid_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    affiliateLinkId: text("affiliate_link_id").references(
      () => affiliateLink.id,
      { onDelete: "cascade", onUpdate: "cascade" }
    ),
    promotionCodeId: uuid("promotion_code_id").references(
      () => promotionCodes.id,
      { onDelete: "set null" }
    ),
    unpaidAmount: numeric("unpaid_amount", { precision: 10, scale: 2 })
      .default("0")
      .notNull(),
    reason: text("reason")
      .$type<AffiliateInvoiceReason>()
      .notNull()
      .default("one_time"),
    status: text("status")
      .$type<CommissionStatus>()
      .notNull()
      .default("pending"),
    suspicionScore: integer("suspicion_score").notNull().default(0),
    suspicionReasons: text("suspicion_reasons").array(),
    holdUntil: timestamp("hold_until"),
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
export const promotionCodes = pgTable(
  "promotion_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 255 }).notNull(),
    externalId: varchar("external_id", { length: 255 }).notNull(),
    stripeCouponId: varchar("stripe_coupon_id", { length: 255 }),
    provider: text("provider").$type<PaymentProvider>().notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    discountType: text("discount_type").$type<ValueType>().notNull(),
    discountValue: numeric("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: varchar("currency", { length: 3 }).default("USD").notNull(),
    commissionType: text("commission_type")
      .$type<ValueType>()
      .default("PERCENTAGE")
      .notNull(),
    commissionValue: numeric("commission_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    commissionDurationValue: integer("commission_duration_value")
      .default(1)
      .notNull(),
    commissionDurationUnit: text("commission_duration_unit")
      .$type<DurationUnit>()
      .default("month")
      .notNull(),
    totalSales: integer("total_sales").default(0).notNull(),
    totalRevenueGenerated: numeric("total_revenue_generated", {
      precision: 15,
      scale: 2,
    })
      .default("0.00")
      .notNull(),
    affiliateId: uuid("affiliate_id").references(() => affiliate.id, {
      onDelete: "set null",
    }),
    isSeenByAffiliate: boolean("is_seen_by_affiliate").default(false).notNull(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    deletedAt: timestamp("deleted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("promotion_codes_external_id_idx").on(table.externalId),
    index("promotion_codes_organization_id_idx").on(table.organizationId),
    uniqueIndex("promo_org_unique_idx").on(
      table.externalId,
      table.organizationId
    ),
  ]
)
export const referrals = pgTable(
  "referrals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    affiliateId: uuid("affiliate_id").references(() => affiliate.id, {
      onDelete: "cascade",
    }),
    organizationId: text("organization_id").notNull(),
    signupEmail: varchar("signup_email", { length: 255 }),
    promotionCodeId: uuid("promotion_code_id").references(
      () => promotionCodes.id
    ),
    affiliateLinkId: text("referral_link_id").references(
      () => affiliateLink.id,
      {
        onDelete: "cascade",
        onUpdate: "cascade",
      }
    ),
    signedAt: timestamp("signed_at").defaultNow().notNull(),
    convertedAt: timestamp("converted_at"),
    totalRevenue: numeric("total_revenue", { precision: 15, scale: 2 }).default(
      "0.00"
    ),
    commissionEarned: numeric("commission_earned", {
      precision: 15,
      scale: 2,
    }).default("0.00"),
    isSeenByAffiliate: boolean("is_seen_by_affiliate").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("referrals_email_link_idx").on(
      table.signupEmail,
      table.affiliateLinkId
    ),
  ]
)
export const subscriptionExpiration = pgTable(
  "subscription_expiration",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subscriptionId: text("subscription_id").notNull().unique(),
    promotionCodeId: uuid("promotion_code_id").references(
      () => promotionCodes.id,
      { onDelete: "set null" }
    ),
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
export const affiliateInviteToken = pgTable("affiliate_invite_token", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: text("org_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  email: text("email"),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => createId()),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
export const licenseKeys = pgTable(
  "license_keys",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    key: text("key").notNull().unique(),
    polarId: text("polar_id").unique(),
    status: text("status").$type<LicenseStatus>().notNull().default("active"),
    tier: text("tier").$type<PurchaseTier>().notNull().default("PRO"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    lastValidatedAt: timestamp("last_validated_at", { withTimezone: true }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("license_keys_user_id_idx").on(table.userId),
    index("license_keys_key_idx").on(table.key),
  ]
)
export const licenseActivations = pgTable(
  "license_activations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    licenseId: uuid("license_id")
      .notNull()
      .references(() => licenseKeys.id, { onDelete: "cascade" }),
    activationId: text("activation_id").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("license_activations_license_id_idx").on(table.licenseId),
    unique("unique_license_activation").on(table.licenseId, table.activationId),
  ]
)
export const systemSettings = pgTable("system_settings", {
  id: integer("id").primaryKey().default(1),
  installedVersion: text("installed_version").notNull().default("0.1.0"),
  lastUpdated: timestamp("last_updated").defaultNow(),
  latestAvailableVersion: text("latest_available_version"),
})
export const discordAccount = pgTable(
  "discord_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: text("owner_id").notNull().unique(),
    discordUserId: text("discord_user_id").notNull(),
    discordUsername: text("discord_username").notNull(),
    plan: text("plan").$type<Plan>().notNull(),
    isSelfHosted: boolean("is_self_hosted").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("discord_account_discord_user_idx").on(table.discordUserId)]
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
