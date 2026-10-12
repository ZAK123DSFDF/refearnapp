export interface PlanInfo {
  plan: "FREE" | "PRO" | "ULTIMATE"
  type: "FREE" | "SUBSCRIPTION" | "PURCHASE" | "EXPIRED"
  cycle?: "MONTHLY" | "YEARLY"
  subscriptionId?: string
  hasPendingPurchase?: boolean
  pendingPurchaseTier?: "PRO" | "ULTIMATE"
  subscriptionChangeAt?: Date | null
  userId?: string
  isAppSumo?: boolean
  appsumoTier?: number
  provider?: "paddle" | "polar"
}
