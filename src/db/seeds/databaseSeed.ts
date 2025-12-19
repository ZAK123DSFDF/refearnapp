import {
  buildAuthCustomizationSeed,
  buildDashboardCustomizationSeed,
} from "@/util/CustomizationSeed"

const parseDate = (str: string) => {
  const fixed = str.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1") + "Z"
  return new Date(fixed)
}
export const affiliate_seed = [
  {
    id: "dd01db57-233b-4dd2-9230-d132c9462c03",
    name: "zak",
    email: "zak@gmail.com",
    type: "AFFILIATE" as const,
    createdAt: parseDate("2025-07-16 11:51:09.338106"),
    updatedAt: parseDate("2025-07-16 11:51:09.338106"),
    organizationId: "tp7JLBb5",
  },
]
export const affiliate_click_seed = [
  {
    id: "49tLBh1i",
    affiliateLinkId: "fWL6hk",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    referrer: "unknown",
    deviceType: "desktop",
    browser: "Chrome",
    os: "Windows",
    createdAt: parseDate("2025-07-16 15:29:57.940116"),
    updatedAt: parseDate("2025-07-16 15:29:57.940116"),
  },
  {
    id: "twMQa5ZP",
    affiliateLinkId: "7NyEjR",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
    referrer: "unknown",
    deviceType: "desktop",
    browser: "Chrome",
    os: "Windows",
    createdAt: parseDate("2025-07-16 15:22:46.261015"),
    updatedAt: parseDate("2025-07-16 15:22:46.261015"),
  },
]
export const affiliate_invoice_seed = [
  {
    id: "pay_Gy5iQw4H8",
    paymentProvider: "stripe" as const,
    subscriptionId: "sub_1RlXCb4gdP9i8VnszkmkpkvO",
    customerId: "cus_Sgv2TtRQI8unK2",
    amount: "20.00",
    currency: "USD" as const,
    commission: "10.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "10.00",
    reason: "subscription_create" as const,
    createdAt: parseDate("2025-07-16 15:26:16.894221"),
    updatedAt: parseDate("2025-07-16 15:26:16.894221"),
  },
  {
    id: "pay_SLQGzPGq6",
    paymentProvider: "stripe" as const,
    subscriptionId: null,
    customerId: "cus_oneTime_yarRPovbr6EZKF",
    amount: "30.00",
    currency: "USD" as const,
    commission: "15.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "15.00",
    reason: "one_time" as const,
    createdAt: parseDate("2025-06-06 15:28:42"),
    updatedAt: parseDate("2025-07-16 15:28:42"),
  },
  {
    id: "pay_X17ybFwtv",
    paymentProvider: "stripe" as const,
    subscriptionId: "sub_1RlXCb4gdP9i8VnszkmkpkvO",
    customerId: "cus_Sgv2TtRQI8unK2",
    amount: "-20.00",
    currency: "USD" as const,
    commission: "-10.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "-10.00",
    reason: "subscription_update" as const,
    createdAt: parseDate("2025-07-16 15:26:38.589908"),
    updatedAt: parseDate("2025-07-16 15:26:38.589908"),
  },
  {
    id: "pay_iCVk6n4yP",
    paymentProvider: "stripe" as const,
    subscriptionId: "sub_1RlXCb4gdP9i8VnszkmkpkvO",
    customerId: "cus_Sgv2TtRQI8unK2",
    amount: "20.00",
    currency: "USD" as const,
    commission: "10.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "10.00",
    reason: "subscription_update" as const,
    createdAt: parseDate("2025-07-23 15:25:04"),
    updatedAt: parseDate("2025-07-16 15:25:04.430337"),
  },
  {
    id: "pay_jSLhrynfa",
    paymentProvider: "stripe" as const,
    subscriptionId: "sub_1RlXCb4gdP9i8VnszkmkpkvO",
    customerId: "cus_Sgv2TtRQI8unK2",
    amount: "-19.99",
    currency: "USD" as const,
    commission: "-10.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "-9.99",
    reason: "subscription_update" as const,
    createdAt: parseDate("2025-07-16 15:31:15.986216"),
    updatedAt: parseDate("2025-07-16 15:31:15.986216"),
  },
  {
    id: "pay_kxChw76Cv",
    paymentProvider: "stripe" as const,
    subscriptionId: "sub_1RlXCb4gdP9i8VnszkmkpkvO",
    customerId: "cus_Sgv2TtRQI8unK2",
    amount: "19.99",
    currency: "USD" as const,
    commission: "10.00",
    paidAmount: "0.00",
    affiliateLinkId: "7NyEjR",
    unpaidAmount: "9.99",
    reason: "subscription_update" as const,
    createdAt: parseDate("2025-07-16 15:31:00.903045"),
    updatedAt: parseDate("2025-07-16 15:31:00.903045"),
  },
]
export const affiliate_link_seed = [
  {
    id: "7NyEjR",
    createdAt: parseDate("2025-07-16 11:52:26.183274"),
    updatedAt: parseDate("2025-07-16 11:52:26.183274"),
    affiliateId: "dd01db57-233b-4dd2-9230-d132c9462c03",
    organizationId: "tp7JLBb5",
  },
  {
    id: "fWL6hk",
    createdAt: parseDate("2025-07-16 14:54:05.474716"),
    updatedAt: parseDate("2025-07-16 14:54:05.474716"),
    affiliateId: "dd01db57-233b-4dd2-9230-d132c9462c03",
    organizationId: "tp7JLBb5",
  },
]
export const organization_seed = [
  {
    id: "tp7JLBb5",
    name: "Acme Inc",
    websiteUrl: "better-auth-pi.vercel.app",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    logoUrl: null,
    referralParam: "ref" as const,
    cookieLifetimeValue: 30,
    cookieLifetimeUnit: "day",
    commissionType: "percentage",
    commissionValue: "50.00",
    commissionDurationValue: 30,
    commissionDurationUnit: "day",
    currency: "USD" as const,
    createdAt: parseDate("2025-07-16 11:44:07.514288"),
    updatedAt: parseDate("2025-07-16 11:44:07.514288"),
    attributionModel: "LAST_CLICK" as const,
  },
]
export const websiteDomain_seed = [
  {
    id: "4G7kH2B",
    orgId: "tp7JLBb5",
    domainName: "xmm.refearnapp.com", // updated column name
    type: "DEFAULT" as const,
    isActive: true,
    isRedirect: false,
    createdAt: parseDate("2025-10-14 04:00:00"),
    updatedAt: parseDate("2025-10-14 04:00:00"),
  },
]
export const organization_auth_customization_seed = [
  buildAuthCustomizationSeed({
    id: "tp7JLBb5",
    auth: {
      useNotesCustomization: {
        customNotesLogin:
          '<p style="text-align: center;"><span style="color: rgb(13, 227, 17);">This is The Login Page</span></p>',
        customNotesSignup:
          '<p style="text-align: center;"><span style="color: rgb(61, 22, 202);">This is the Signup Page</span></p>',
      },
    },
    createdAt: parseDate("2025-08-12 10:53:45.821"),
    updatedAt: parseDate("2025-08-12 22:15:36.47"),
  }),
]
export const organization_dashboard_customization_seed = [
  buildDashboardCustomizationSeed({
    id: "tp7JLBb5",
    dashboard: {
      useKpiCardCustomization: {
        cardShadowThickness: "sm",
        cardShadow: true,
        cardBorder: true,
      },
    },
    createdAt: parseDate("2025-08-12 10:53:45.24"),
    updatedAt: parseDate("2025-08-12 20:11:21.372"),
  }),
]
export const user_seed = [
  {
    id: "29022934-eb52-49af-aca4-b6ed553c89dd",
    name: "zak",
    email: "zak@gmail.com",
    role: "OWNER" as const,
    type: "ORGANIZATION" as const,
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]
export const subscription_seed = [
  {
    id: "sub_01k9xy70e1jds4mmtzr5qex4ak",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    plan: "FREE" as const,
    billingInterval: "MONTHLY" as const,
    currency: "USD",
    price: "0.00",
    expiresAt: parseDate("2099-12-31 23:59:59"),
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]
export const account_seed = [
  {
    id: "f1a2b3c4-d5e6-7f89-0123-456789abcdef", // constant UUID
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    provider: "credentials" as const,
    providerAccountId: "zak@gmail.com",
    password: "$2b$10$StHXjJi6UvIye0GVPmDp4uRXnjAuBAuqNZhnzTLb24U0.l98LjH3C",
    emailVerified: parseDate("2025-07-16 11:43:21.288497"),
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]

export const affiliate_account_seed = [
  {
    id: "a1b2c3d4-e5f6-7890-1234-56789abcdef0", // constant UUID
    affiliateId: "dd01db57-233b-4dd2-9230-d132c9462c03",
    provider: "credentials" as const,
    providerAccountId: "zak@gmail.com",
    password: "$2b$10$PnbuKyGgf4XRYCHUr.EDtu6yTaVgGdihZM/u5q54Jryix9xYRG0q2",
    emailVerified: parseDate("2025-07-16 11:51:09.338106"),
    createdAt: parseDate("2025-07-16 11:51:09.338106"),
    updatedAt: parseDate("2025-07-16 11:51:09.338106"),
  },
]
export const team_seed = [
  {
    id: "4a2e1a11-bef7-49f9-9333-52123c9e99aa",
    name: "John Doe",
    email: "john.doe@acme.com",
    role: "TEAM" as const,
    type: "ORGANIZATION" as const,
    organizationId: "tp7JLBb5",
    isActive: true,
    createdAt: parseDate("2025-07-16 11:53:21.288497"),
    updatedAt: parseDate("2025-07-16 11:53:21.288497"),
  },
  {
    id: "d73a2b1a-27b4-4bda-91e0-82d2a5191c33",
    name: "Jane Smith",
    email: "jane.smith@acme.com",
    role: "TEAM" as const,
    type: "ORGANIZATION" as const,
    organizationId: "tp7JLBb5",
    isActive: true,
    createdAt: parseDate("2025-07-16 11:53:22.288497"),
    updatedAt: parseDate("2025-07-16 11:53:22.288497"),
  },
  {
    id: "c9e3b4a4-f1a2-4a7b-bb59-2ad3a3c1e7f1",
    name: "Michael Green",
    email: "michael.green@acme.com",
    role: "TEAM" as const,
    type: "ORGANIZATION" as const,
    organizationId: "tp7JLBb5",
    isActive: true,
    createdAt: parseDate("2025-07-16 11:53:23.288497"),
    updatedAt: parseDate("2025-07-16 11:53:23.288497"),
  },
]
export const team_account_seed = [
  {
    id: "8e1f223d-4a77-4c99-9450-72f0f6c3b911",
    teamId: "4a2e1a11-bef7-49f9-9333-52123c9e99aa",
    provider: "credentials" as const,
    providerAccountId: "john.doe@acme.com",
    password: "$2b$10$QAhXwW/GJe0fCC0PrzUM0eShbWhqxeFxGLyplXXm5KjKWhB9kbke6", // bcrypt hash
    emailVerified: parseDate("2025-07-16 11:53:21.288497"),
    createdAt: parseDate("2025-07-16 11:53:21.288497"),
    updatedAt: parseDate("2025-07-16 11:53:21.288497"),
  },
  {
    id: "9f0f8a4d-94df-4fd2-a9b1-6f7a5cf01982",
    teamId: "d73a2b1a-27b4-4bda-91e0-82d2a5191c33",
    provider: "credentials" as const,
    providerAccountId: "jane.smith@acme.com",
    password: "$2b$10$O5gQs0cTVCaQ8bDmv9qz9uS1Ckp4I5yE9dyM2UWRvRm0I4D6Eoq6i", // bcrypt hash
    emailVerified: parseDate("2025-07-16 11:53:22.288497"),
    createdAt: parseDate("2025-07-16 11:53:22.288497"),
    updatedAt: parseDate("2025-07-16 11:53:22.288497"),
  },
  {
    id: "b37e2a1b-1f25-4f48-b74c-2b6e4fa124af",
    teamId: "c9e3b4a4-f1a2-4a7b-bb59-2ad3a3c1e7f1",
    provider: "credentials" as const,
    providerAccountId: "michael.green@acme.com",
    password: "$2b$10$TnRsoSfxJ8lbObn1tKTHeuH0l84GBl2wr7jCe3mP2Sv9HkHIkH0iq", // bcrypt hash
    emailVerified: parseDate("2025-07-16 11:53:23.288497"),
    createdAt: parseDate("2025-07-16 11:53:23.288497"),
    updatedAt: parseDate("2025-07-16 11:53:23.288497"),
  },
]
