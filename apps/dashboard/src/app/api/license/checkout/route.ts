import { handleRoute } from "@/lib/handleRoute"
import { Polar } from "@polar-sh/sdk"
import { NextResponse } from "next/server"
import { polarConfig } from "@/lib/polarConfig"
import { AppError } from "@/lib/exceptions"
const polar = new Polar({
  accessToken: polarConfig.accessToken,
  server: polarConfig.server,
})
export const POST = handleRoute("CheckoutCreation", async (req) => {
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  if (isSelfHosted) {
    throw new AppError({
      status: 403,
      error: "DISABLED",
      toast: "Billing is disabled in self-hosted mode.",
    })
  }
  const { targetPlan, upgrade } = await req.json()
  let productId =
    targetPlan === "PRO"
      ? polarConfig.productIds.PRO
      : polarConfig.productIds.ULTIMATE

  if (upgrade && targetPlan === "ULTIMATE") {
    productId = polarConfig.productIds.ULTIMATE_UPGRADE
  }
  const result = await polar.checkouts.create({
    products: [productId],
  })
  if (!result || !result.url) {
    throw new AppError({
      status: 500,
      error: "CHECKOUT_FAILED",
      toast: "Could not initialize checkout. Please try again later.",
    })
  }

  return NextResponse.json({ url: result.url })
})
