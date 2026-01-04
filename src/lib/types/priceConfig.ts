export type PricingTier = "PRO" | "ULTIMATE"
export type SubscriptionCycle = "MONTHLY" | "YEARLY"

interface PricingConfig {
  readonly SUBSCRIPTION: {
    readonly [K in PricingTier]: {
      readonly [C in SubscriptionCycle]: number
    }
  }
  readonly PURCHASE: {
    readonly [K in PricingTier]: number
  }
  readonly MARKUP_PERCENT: number
}

export const PRICING_CONFIG: PricingConfig = {
  SUBSCRIPTION: {
    PRO: { MONTHLY: 25, YEARLY: 252 },
    ULTIMATE: { MONTHLY: 40, YEARLY: 403 },
  },
  PURCHASE: {
    PRO: 199,
    ULTIMATE: 299,
  },
  MARKUP_PERCENT: 1.43,
} as const
