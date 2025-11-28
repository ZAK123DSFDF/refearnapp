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
export const changeTypeEnum = pgEnum("change_type", [
  "SUBSCRIPTION",
  "ONE_TIME",
])
export const applyChangeAtEnum = pgEnum("apply_change_at", [
  "RENEWAL",
  "IMMEDIATE",
])
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
export const domainTypeEnum = pgEnum("domain_type", ["DEFAULT", "CUSTOM"])
export const affiliateInvoiceReasonEnum = pgEnum("affiliate_invoice_reason", [
  "subscription_create",
  "subscription_update",
  "one_time",
  "refund",
  "manual_adjustment",
])
export const providerEnum = pgEnum("provider", ["credentials", "google"])
export const user = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: roleEnum("role").default("OWNER").notNull(),
  type: accountTypeEnum("type").default("ORGANIZATION").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
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
    unique("org_team_email_unique").on(table.email, table.organizationId),
  ]
)
export const teamAccount = pgTable("team_account", {
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
})
export const account = pgTable("account", {
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
})
export const subscription = pgTable("subscription", {
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
})
export const purchase = pgTable("purchase", {
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
})
// ORGANIZATION SCHEMA
export const organization = pgTable("organization", {
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
})
export const websiteDomain = pgTable("website_domain", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateDomainId()),
  orgId: text("org_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  domainName: text("domain_name").notNull().unique(),
  type: domainTypeEnum("type").notNull().default("DEFAULT"),
  isActive: boolean("is_active").notNull().default(false),
  isRedirect: boolean("is_redirect").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
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
  }
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
  }
)
export const payoutReference = pgTable("payout_reference", {
  refId: varchar("ref_id", { length: 12 }).primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),
  affiliateId: uuid("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),
  isUnpaid: boolean("is_unpaid").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})
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
  (table) => [unique("org_email_unique").on(table.email, table.organizationId)]
)
export const affiliateAccount = pgTable("affiliate_account", {
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
})
export const affiliatePayoutMethod = pgTable("affiliate_payout_method", {
  id: uuid("id").primaryKey().defaultRandom(),
  affiliateId: uuid("affiliate_id")
    .notNull()
    .references(() => affiliate.id, { onDelete: "cascade" }),

  provider: payoutProviderEnum("provider").notNull(),
  accountIdentifier: text("account_identifier").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
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
export const affiliateLink = pgTable("affiliate_link", {
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
})
export const affiliateClick = pgTable("affiliate_click", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateAffiliateClickId()),
  affiliateLinkId: text("affiliate_link_id")
    .notNull()
    .references(() => affiliateLink.id, { onDelete: "cascade" }),
  userAgent: text("user_agent"),
  referrer: text("referrer").default("unknown").notNull(),
  deviceType: text("device_type"),
  browser: text("browser"),
  os: text("os"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
export const affiliateInvoice = pgTable("affiliate_invoice", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateAffiliatePaymentLinkId()),
  paymentProvider: paymentProviderEnum("payment_provider").notNull(),
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
export const subscriptionExpiration = pgTable("subscription_expiration", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),

  subscriptionId: text("subscription_id").notNull().unique(),

  expirationDate: timestamp("expiration_date").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
export const checkTransaction = pgTable("check_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  customerId: text("customer_id").notNull(),
  subscriptionId: text("subscription_id"),
  amount: numeric("amount", { precision: 10, scale: 2 })
    .notNull()
    .default("0.00"),
  currency: text("currency").notNull(),
  expirationDate: timestamp("expiration_date").notNull(),
  customData: jsonb("custom_data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
export const invitation = pgTable("invitation", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => generateInviteLinkId()),
  email: text("email").notNull(),
  organizationId: text("organization_id")
    .notNull()
    .references(() => organization.id, { onDelete: "cascade" }),

  title: text("title"), // Optional email subject
  body: text("body"), // Optional message content

  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => createId()),
  accepted: boolean("accepted").default(false).notNull(),

  expiresAt: timestamp("expires_at"), // Optional expiration
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

export const organizationDashboardCustomization = pgTable(
  "organization_dashboard_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id),
    dashboard: jsonb("dashboard").$type<{
      useSidebarCustomization: {
        sideBarBackgroundColor: string
        sideBarActiveNavigationTextColor: string
        sideBarInActiveNavigationTextColor: string
        sideBarActiveNavigationBackgroundColor: string
        sideBarHoverNavigationBackgroundColor: string
        sideBarHoverNavigationTextColor: string
        sideBarProfileBackgroundColor: string
        sideBarProfileTextPrimaryColor: string
        sideBarProfileTextSecondaryColor: string
        sideBarNavigationFocusRingColor: string
      }
      useDashboardCardCustomization: {
        dashboardCardShadowThickness: string
        dashboardCardBorderColor: string
        dashboardCardBackgroundColor: string
        dashboardCardShadowColor: string
        dashboardCardBorder: boolean
        dashboardCardShadow: boolean
      }
      useDashboardThemeCustomization: {
        mainBackgroundColor: string
        separatorColor: string
        dashboardHeaderNameColor: string
        dashboardHeaderDescColor: string
        cardHeaderPrimaryTextColor: string
        cardHeaderSecondaryTextColor: string
        dialogHeaderColor: string
        cardHeaderDescriptionTextColor: string
        missingPaypalHeaderColor: string
        missingPaypalDescriptionColor: string
      }
      useDashboardButtonCustomization: {
        dashboardButtonBackgroundColor: string
        dashboardButtonTextColor: string
        dashboardButtonDisabledBackgroundColor: string
        dashboardButtonDisabledTextColor: string
      }
      useTableCustomization: {
        tableHeaderTextColor: string
        tableHoverBackgroundColor: string
        tableIconColor: string
        tableIconHoverColor: string
        tableIconHoverBackgroundColor: string
        tableRowPrimaryTextColor: string
        tableRowSecondaryTextColor: string
        tableRowTertiaryTextColor: string
        tableRowBadgeOverDueTextColor: string
        tableRowBadgeOverDueBackgroundColor: string
        tableRowBadgePendingTextColor: string
        tableRowBadgePendingBackgroundColor: string
        tableRowBadgePaidTextColor: string
        tableRowBadgePaidBackgroundColor: string
        tableBorderColor: string
        tableLoadingColor: string
        tableEmptyTextColor: string
        tableErrorTextColor: string
      }
      useDialogCustomization: {
        dialogBackgroundColor: string
        dialogCloseIconColor: string
        dialogCloseIconBorderColor: string
      }
      useYearSelectCustomization: {
        yearSelectBackgroundColor: string
        yearSelectTextColor: string
        yearSelectActiveBorderColor: string
        yearSelectDropDownBackgroundColor: string
        yearSelectDropDownTextColor: string
        yearSelectDropDownActiveTextColor: string
        yearSelectDropDownActiveBackgroundColor: string
        yearSelectDropDownIconColor: string
        yearSelectDropDownHoverBackgroundColor: string
        yearSelectDropDownHoverTextColor: string
      }
      useToastCustomization: {
        toastBackgroundColor: string
        toastTitleColor: string
        toastDescriptionColor: string
        toastErrorBackgroundColor: string
        toastErrorTitleColor: string
        toastErrorDescriptionColor: string
      }
      useKpiCardCustomization: {
        cardShadowColor: string
        cardBorderColor: string
        cardPrimaryTextColor: string
        cardSecondaryTextColor: string
        cardIconPrimaryColor: string
        cardIconSecondaryColor: string
        cardIconTertiaryColor: string
        cardIconPrimaryBackgroundColor: string
        cardIconSecondaryBackgroundColor: string
        cardIconTertiaryBackgroundColor: string
        cardShadowThickness: string
        cardBackgroundColor: string
        cardShadow: boolean
        cardBorder: boolean
        kpiLoadingColor: string
        kpiErrorColor: string
        kpiEmptyTextColor: string
      }
      useChartCustomization: {
        chartHorizontalLineColor: string
        chartDateColor: string
        chartPrimaryColor: string
        chartSecondaryColor: string
        chartTertiaryColor: string
        chartLegendTextColor: string
        toolTipChartDateColor: string
        toolTipBackgroundColor: string
        toolTipTextColor: string
        toolTipNumberColor: string
        chartLoadingColor: string
        chartErrorColor: string
      }
      usePieChartColorCustomization: {
        pieColor1: string
        pieColor2: string
        pieColor3: string
        pieColor4: string
        pieColor5: string
        pieColor6: string
        pieColor7: string
        pieColor8: string
        pieFallbackColor: string
        pieChartLoadingColor: string
        pieChartEmptyTextColor: string
        pieChartErrorColor: string
      }
      useLogoutButtonCustomization: {
        logoutButtonBackgroundColor: string
        logoutButtonTextColor: string
        logoutButtonDisabledBackgroundColor: string
        logoutButtonDisabledTextColor: string
      }
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
)
export const organizationAuthCustomization = pgTable(
  "organization_auth_customization",
  {
    id: text("id")
      .primaryKey()
      .references(() => organization.id),
    auth: jsonb("auth").$type<{
      useCardCustomization: {
        cardShadowColor: string
        cardBorderColor: string
        cardBackgroundColor: string
        cardShadowThickness: string
        cardShadow: boolean
        cardBorder: boolean
      }
      useInputCustomization: {
        inputLabelColor: string
        inputLabelErrorColor: string
        inputIconColor: string
        inputTextColor: string
        inputErrorTextColor: string
        inputBorderColor: string
        inputErrorBorderColor: string
        inputPlaceholderTextColor: string
        inputBorderFocusColor: string
      }
      useCheckboxCustomization: {
        checkboxLabelColor: string
        checkboxActiveColor: string
        checkboxInactiveColor: string
      }
      useButtonCustomization: {
        buttonTextColor: string
        buttonBackgroundColor: string
        buttonDisabledTextColor: string
        buttonDisabledBackgroundColor: string
      }
      useGoogleButtonCustomization: {
        googleButtonTextColor: string
        googleButtonBackgroundColor: string
        googleIconColor: string
      }
      useThemeCustomization: {
        headerColor: string
        backgroundColor: string
        linkTextColor: string
        tertiaryTextColor: string
        primaryCustomization: string
        secondaryCustomization: string
        InvalidPrimaryCustomization: string
        InvalidSecondaryCustomization: string
        emailVerifiedPrimaryColor: string
        emailVerifiedSecondaryColor: string
        emailVerifiedIconColor: string
        splashLoadingColor: string
        splashLoadingTextColor: string
        splashErrorIconColor: string
        splashErrorTextColor: string
        checkEmailPrimaryColor: string
        checkEmailSecondaryColor: string
        googleSeparatorColor: string
      }
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  }
)
