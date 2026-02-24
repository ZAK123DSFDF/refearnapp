import { Environment } from "@paddle/paddle-node-sdk"

const isProd = process.env.NODE_ENV === "production"

export const paddleConfig = {
  env: isProd ? Environment.production : Environment.sandbox,
  server: {
    apiToken: isProd
      ? process.env.PADDLE_SECRET_TOKEN_PRODUCTION!
      : process.env.PADDLE_SECRET_TOKEN_SANDBOX!,
    webhookSecret: isProd
      ? process.env.PADDLE_WEBHOOK_SECRET_PRODUCTION!
      : process.env.PADDLE_WEBHOOK_SECRET_SANDBOX!,
  },
  client: {
    token: isProd
      ? process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_PRODUCTION!
      : process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN_SANDBOX!,
    checkoutEnvironment: isProd
      ? ("production" as const)
      : ("sandbox" as const),
  },
  priceIds: {
    SUBSCRIPTION: {
      MONTHLY: {
        PRO: isProd
          ? process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_PRO_MONTHLY_PRODUCTION!
          : process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_PRO_MONTHLY_SANDBOX!,
        ULTIMATE: isProd
          ? process.env
            .NEXT_PUBLIC_PADDLE_PRICE_SUB_ULTIMATE_MONTHLY_PRODUCTION!
          : process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_ULTIMATE_MONTHLY_SANDBOX!,
      },
      YEARLY: {
        PRO: isProd
          ? process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_PRO_YEARLY_PRODUCTION!
          : process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_PRO_YEARLY_SANDBOX!,
        ULTIMATE: isProd
          ? process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_ULTIMATE_YEARLY_PRODUCTION!
          : process.env.NEXT_PUBLIC_PADDLE_PRICE_SUB_ULTIMATE_YEARLY_SANDBOX!,
      },
    },
    PURCHASE: {
      PRO: isProd
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_PRO_PRODUCTION!
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_PRO_SANDBOX!,
      ULTIMATE: isProd
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_ULTIMATE_PRODUCTION!
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_ULTIMATE_SANDBOX!,
      ULTIMATE_UPGRADE_FROM_PRO: isProd
        ? process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_ULTIMATE_UPGRADE_PRODUCTION!
        : process.env.NEXT_PUBLIC_PADDLE_PRICE_BUY_ULTIMATE_UPGRADE_SANDBOX!,
    },
  },
  portal: isProd
    ? process.env.NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_PRODUCTION || ""
    : process.env.NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL_SANDBOX ||
    "https://sandbox-customer-portal.paddle.com/cpl_01k9cee59hfjpa5qfp6592h1x3",
}