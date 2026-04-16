"use server"
import { handleAction } from "@/lib/handleAction"
import type { MutationData } from "@/lib/types/organization/response"
import { updatePlan } from "@/lib/server/organization/updatePlan"
import { AppError } from "@/lib/exceptions"
import { CENTRAL_API_URL } from "@/lib/constants/centralDomain"

export async function updateSubscriptionAction({
  subscriptionId,
  targetPlan,
  targetCycle,
  mode,
  modeType,
}: {
  subscriptionId: string
  targetPlan: "PRO" | "ULTIMATE"
  targetCycle?: "MONTHLY" | "YEARLY"
  mode: "PRORATE" | "DO_NOT_BILL"
  modeType: "SUB_TO_SUB" | "SUB_TO_ONE_TIME"
}): Promise<MutationData> {
  return handleAction("updateSubscriptionAction", async () => {
    if (!subscriptionId)
      throw new AppError({ status: 400, toast: "Invalid subscription" })

    await updatePlan({
      subscriptionId,
      targetPlan,
      targetCycle,
      mode,
      modeType,
    })

    return {
      ok: true,
      toast: "Subscription updated successfully",
    }
  })
}
export async function createSelfHostedCheckoutAction({
  targetPlan,
  upgrade = false,
}: {
  targetPlan: string
  upgrade?: boolean
}) {
  return handleAction("createSelfHostedCheckoutAction", async () => {
    // 1. Safety Guard
    if (process.env.NEXT_PUBLIC_SELF_HOSTED !== "true") {
      throw new AppError({
        status: 403,
        error: "FORBIDDEN",
        toast: "This action is only available for self-hosted instances.",
      })
    }

    // 2. API Call
    const response = await fetch(`${CENTRAL_API_URL}/api/license/checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ targetPlan, upgrade }),
    })

    const data = await response.json()

    // 3. Handle failure via AppError
    if (!response.ok) {
      throw new AppError({
        status: response.status || 500,
        error: data.error || "CHECKOUT_INIT_FAILED",
        toast: data.toast || data.message || "Failed to create checkout",
      })
    }

    // 4. Return success shape matching your MutationData
    return {
      ok: true,
      redirectUrl: data.url,
      toast: "Redirecting to checkout...",
    }
  })
}
