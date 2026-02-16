import {
  buildAuthCustomizationSeed,
  buildDashboardCustomizationSeed,
} from "@/util/CustomizationSeed"
import {
  generateAffiliateClickId,
  generateAffiliateCode,
  generateAffiliatePaymentLinkId,
} from "@/util/idGenerators"

const parseDate = (str: string) => {
  const fixed = str.replace(" ", "T").replace(/(\.\d{3})\d+/, "$1") + "Z"
  return new Date(fixed)
}
const ORG_ID = "tp7JLBb5"
const PASSWORD_HASH =
  "$2b$10$PnbuKyGgf4XRYCHUr.EDtu6yTaVgGdihZM/u5q54Jryix9xYRG0q2"
const PAYPAL_PERSONAL_EMAILS = Array.from(
  { length: 20 },
  (_, i) => `personal-sb-${i + 1}@test.example.com`
)
const INVOICE_REASONS = ["subscription_create"] as const
const randomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min

const randomDateIn2025 = () => {
  const month = randomInt(0, 11) // JS months 0–11
  const day = randomInt(1, 28) // safe for all months
  const hour = randomInt(0, 23)
  const minute = randomInt(0, 59)
  const second = randomInt(0, 59)

  return new Date(Date.UTC(2025, month, day, hour, minute, second))
}

export const affiliate_seed = Array.from({ length: 20 }, (_, i) => {
  // Logic for the first entry vs the rest
  const isFirst = i === 0

  const name = isFirst ? "zekariyas" : `zak${i}`
  const email = isFirst ? "zekariyasberihun8@gmail.com" : `zak${i}@gmail.com`

  return {
    id: crypto.randomUUID(),
    name: name,
    email: email,
    type: "AFFILIATE" as const,
    organizationId: ORG_ID,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
export const affiliate_link_seed = affiliate_seed.flatMap((affiliate) => {
  const firstDate = randomDateIn2025()
  const secondDate = randomDateIn2025()

  return [
    {
      id: generateAffiliateCode(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      createdAt: firstDate,
      updatedAt: firstDate,
    },
    {
      id: generateAffiliateCode(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      createdAt: secondDate,
      updatedAt: secondDate,
    },
  ]
})
export const affiliate_click_seed = affiliate_link_seed.flatMap((link) => {
  const clicksCount = randomInt(1, 4)

  return Array.from({ length: clicksCount }, () => {
    const date = randomDateIn2025()

    return {
      id: generateAffiliateClickId(),
      affiliateLinkId: link.id,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
      referrer: "unknown",
      deviceType: "desktop",
      browser: "Chrome",
      os: "Windows",
      createdAt: date,
      updatedAt: date,
    }
  })
})

export const affiliate_invoice_seed = affiliate_link_seed.flatMap((link) => {
  const invoiceCount = randomInt(1, 2)

  return Array.from({ length: invoiceCount }, () => {
    const date = randomDateIn2025()
    const amount = randomInt(10, 100)
    const commission = Math.round(amount * 0.5 * 100) / 100 // 50%

    return {
      id: generateAffiliatePaymentLinkId(),
      paymentProvider: "stripe" as const,
      subscriptionId:
        Math.random() > 0.5 ? `sub_${crypto.randomUUID().slice(0, 10)}` : null,
      customerId: `cus_${crypto.randomUUID().slice(0, 10)}`,
      amount: amount.toFixed(2),
      currency: "USD" as const,
      rawAmount: amount.toFixed(2),
      rawCurrency: "USD",
      commission: commission.toFixed(2),
      paidAmount: "0.00",
      unpaidAmount: commission.toFixed(2),
      affiliateLinkId: link.id,
      reason: INVOICE_REASONS[randomInt(0, INVOICE_REASONS.length - 1)],
      createdAt: date,
      updatedAt: date,
    }
  })
})

export const organization_seed = [
  {
    id: "tp7JLBb5",
    name: "Acme Inc",
    websiteUrl: "better-auth-pi.vercel.app",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    logoUrl: null,
    referralParam: "ref" as const,
    cookieLifetimeValue: 30,
    cookieLifetimeUnit: "day" as const,
    commissionType: "PERCENTAGE" as const,
    commissionValue: "50.00",
    commissionDurationValue: 30,
    commissionDurationUnit: "day" as const,
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
    isPrimary: true,
    isVerified: true,
    dnsStatus: "Verified" as const,
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
export const promotion_codes_seed = affiliate_seed.flatMap((affiliate, idx) => {
  const count = idx === 0 ? 25 : 2
  return Array.from({ length: count }, (_, i) => ({
    id: crypto.randomUUID(),
    code: `PROMO_${i}_${affiliate.name.toUpperCase()}`,
    externalId: `ext_${crypto.randomUUID().slice(0, 8)}_${i}`,
    provider: "paddle" as const,
    isActive: true,
    discountType: "PERCENTAGE" as const,
    discountValue: "10.00",
    commissionType: "PERCENTAGE" as const,
    commissionValue: "20.00",
    commissionDurationValue: 1,
    commissionDurationUnit: "month" as const,
    affiliateId: affiliate.id,
    organizationId: ORG_ID,
    isSeenByAffiliate: i > 5,
    createdAt: randomDateIn2025(),
    updatedAt: new Date(),
  }))
})
export const referrals_seed = affiliate_seed.flatMap((affiliate, idx) => {
  const count = idx === 0 ? 60 : 5
  const promo = promotion_codes_seed.find((p) => p.affiliateId === affiliate.id)
  const link = affiliate_link_seed.find((l) => l.affiliateId === affiliate.id)

  return Array.from({ length: count }, (_, i) => {
    const isConverted = i % 3 === 0
    const signedAt = randomDateIn2025()

    return {
      id: crypto.randomUUID(),
      affiliateId: affiliate.id,
      organizationId: ORG_ID,
      signupEmail: `user_${i}_${affiliate.name}@example.com`,
      promotionCodeId: i % 2 === 0 ? promo?.id : null,
      affiliateLinkId: i % 2 !== 0 ? link?.id : null,
      signedAt: signedAt,
      convertedAt: isConverted
        ? new Date(signedAt.getTime() + randomInt(1, 4) * 86400000)
        : null,
      totalRevenue: isConverted ? "150.00" : "0.00",
      commissionEarned: isConverted ? "30.00" : "0.00",
      isSeenByAffiliate: i >= 10,
      createdAt: signedAt,
      updatedAt: signedAt,
    }
  })
})
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
    email: "zekariyasberihun8@gmail.com",
    role: "OWNER" as const,
    type: "ORGANIZATION" as const,
    createdAt: parseDate("2025-07-16 11:43:21.288497"),
    updatedAt: parseDate("2025-07-16 11:43:21.288497"),
  },
]
// export const subscription_seed = [
//   {
//     id: "sub_01k9xy70e1jds4mmtzr5qex4ak",
//     userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
//     plan: "FREE" as const,
//     billingInterval: "MONTHLY" as const,
//     currency: "USD",
//     price: "0.00",
//     expiresAt: parseDate("2099-12-31 23:59:59"),
//     createdAt: parseDate("2025-07-16 11:43:21.288497"),
//     updatedAt: parseDate("2025-07-16 11:43:21.288497"),
//   },
// ]
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

export const affiliate_account_seed = affiliate_seed.map((affiliate) => ({
  id: crypto.randomUUID(),
  affiliateId: affiliate.id,
  provider: "credentials" as const,
  providerAccountId: affiliate.email,
  password: PASSWORD_HASH,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}))
export const affiliate_payout_method_seed = affiliate_seed.map(
  (affiliate, index) => ({
    id: crypto.randomUUID(),
    affiliateId: affiliate.id,
    provider: "paypal" as const,
    accountIdentifier:
      PAYPAL_PERSONAL_EMAILS[index % PAYPAL_PERSONAL_EMAILS.length],
    isDefault: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
)
export const team_seed = Array.from({ length: 20 }, (_, i) => {
  const isFirst = i === 0
  const name = isFirst ? "zekariyas" : `zak${i}`
  const email = isFirst ? "zekariyasberihun8@gmail.com" : `zak${i}@gmail.com`

  return {
    id: crypto.randomUUID(),
    name: name,
    email: email,
    role: "TEAM" as const,
    type: "ORGANIZATION" as const,
    organizationId: ORG_ID,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }
})
export const team_account_seed = team_seed.map((team) => ({
  id: crypto.randomUUID(),
  teamId: team.id,
  provider: "credentials" as const,
  providerAccountId: team.email,
  password: PASSWORD_HASH,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}))
export const purchase_seed = [
  {
    id: "pur_ultimate_lifetime",
    userId: "29022934-eb52-49af-aca4-b6ed553c89dd",
    tier: "ULTIMATE" as const,
    price: "29900",
    currency: "USD",
    priceId: "ultimate_lifetime",
    isActive: true,
    reason: "CONVERT_TO_ONE_TIME" as const,
    createdAt: parseDate("2025-07-16 11:44:00.000"),
  },
]
