// lib/polarConfig.ts
const isProd = process.env.NODE_ENV === "production"
const pick = (prod?: string, sandbox?: string) => (isProd ? prod : sandbox)!

export const polarConfig = {
  server: isProd ? ("production" as const) : ("sandbox" as const),
  accessToken: pick(
    process.env.POLAR_ACCESS_TOKEN_PRODUCTION,
    process.env.POLAR_ACCESS_TOKEN_SANDBOX
  ),
  webhookSecret: pick(
    process.env.POLAR_WEBHOOK_SECRET_PRODUCTION,
    process.env.POLAR_WEBHOOK_SECRET_SANDBOX
  ),
  customerPortalUrl: pick(
    process.env.NEXT_PUBLIC_POLAR_CUSTOMER_PORTAL_URL_PRODUCTION,
    process.env.NEXT_PUBLIC_POLAR_CUSTOMER_PORTAL_URL_SANDBOX
  ),
  productIds: {
    SUBSCRIPTION: {
      MONTHLY: {
        PRO: pick(process.env.POLAR_SUB_PRO_MONTHLY_PRODUCTION, process.env.POLAR_SUB_PRO_MONTHLY_SANDBOX),
        ULTIMATE: pick(process.env.POLAR_SUB_ULTIMATE_MONTHLY_PRODUCTION, process.env.POLAR_SUB_ULTIMATE_MONTHLY_SANDBOX),
      },
      YEARLY: {
        PRO: pick(process.env.POLAR_SUB_PRO_YEARLY_PRODUCTION, process.env.POLAR_SUB_PRO_YEARLY_SANDBOX),
        ULTIMATE: pick(process.env.POLAR_SUB_ULTIMATE_YEARLY_PRODUCTION, process.env.POLAR_SUB_ULTIMATE_YEARLY_SANDBOX),
      },
    },
    PURCHASE: {
      PRO: pick(process.env.POLAR_BUY_PRO_PRODUCTION, process.env.POLAR_BUY_PRO_SANDBOX),
      ULTIMATE: pick(process.env.POLAR_BUY_ULTIMATE_PRODUCTION, process.env.POLAR_BUY_ULTIMATE_SANDBOX),
      ULTIMATE_UPGRADE_FROM_PRO: pick(process.env.POLAR_BUY_ULTIMATE_UPGRADE_PRODUCTION, process.env.POLAR_BUY_ULTIMATE_UPGRADE_SANDBOX),
    },
  },
}
export type PolarProductInfo =
  | { kind: "SUBSCRIPTION"; plan: "PRO" | "ULTIMATE"; interval: "MONTHLY" | "YEARLY" }
  | { kind: "PURCHASE"; plan: "PRO" | "ULTIMATE" }

export function resolvePolarProduct(
  productId: string | null | undefined
): PolarProductInfo | null {
  if (!productId) return null
  const { SUBSCRIPTION: s, PURCHASE: p } = polarConfig.productIds
  const known: Record<string, PolarProductInfo> = {}
  const add = (id: string | undefined, info: PolarProductInfo) => {
    if (id) known[id] = info
  }
  add(s.MONTHLY.PRO, { kind: "SUBSCRIPTION", plan: "PRO", interval: "MONTHLY" })
  add(s.MONTHLY.ULTIMATE, { kind: "SUBSCRIPTION", plan: "ULTIMATE", interval: "MONTHLY" })
  add(s.YEARLY.PRO, { kind: "SUBSCRIPTION", plan: "PRO", interval: "YEARLY" })
  add(s.YEARLY.ULTIMATE, { kind: "SUBSCRIPTION", plan: "ULTIMATE", interval: "YEARLY" })
  add(p.PRO, { kind: "PURCHASE", plan: "PRO" })
  add(p.ULTIMATE, { kind: "PURCHASE", plan: "ULTIMATE" })
  add(p.ULTIMATE_UPGRADE_FROM_PRO, { kind: "PURCHASE", plan: "ULTIMATE" })
  return known[productId] ?? null
}
