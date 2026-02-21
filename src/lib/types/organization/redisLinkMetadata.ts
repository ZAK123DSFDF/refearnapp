export type RedisLinkMetadata = {
  orgId: string
  ownerId: string // The User ID who owns the org
  planType: "FREE" | "PRO" | "ULTIMATE"
  paymentType: "SUBSCRIPTION" | "ONE-TIME"
  expiresAt: string | "null" | null // ISO String or "null"
  name: string
  websiteUrl: string
  referralParam: string
  supportEmail: string
  cookieLifetimeValue: string
  cookieLifetimeUnit: string
  commissionType: string
  commissionValue: string
  commissionDurationValue: string
  commissionDurationUnit: string
  attributionModel: "FIRST_CLICK" | "LAST_CLICK"
  currency: string
}

// This type allows us to pass partial updates safely
export type RedisLinkUpdate = Partial<RedisLinkMetadata>
