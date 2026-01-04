"use client"

import { useEffect, useState } from "react"
import { initializePaddle, Paddle } from "@paddle/paddle-js"
import { paddleConfig } from "@/util/PaddleConfig"
import { PlanInfo } from "@/lib/types/planInfo"
import { getOrganizationToken } from "@/lib/server/getOrganizationToken" // 👈 assuming you already have this type

type SubscriptionCycle = "MONTHLY" | "YEARLY"

type CheckoutParams =
  | {
      type: "PURCHASE"
      plan: "PRO" | "ULTIMATE"
      currentPlan?: PlanInfo | null // 👈 add current plan info
      quantity?: number
      initial?: boolean
    }
  | {
      type: "SUBSCRIPTION"
      plan: "PRO" | "ULTIMATE"
      cycle: SubscriptionCycle
      quantity?: number
      initial?: boolean
    }
type ApplyingReason = "PURCHASE" | "CANCEL" | "UPGRADE"
export function usePaddleCheckout() {
  const [paddle, setPaddle] = useState<Paddle>()
  const [showApplyingDialog, setShowApplyingDialog] =
    useState<null | ApplyingReason>(null)
  const [checkoutClosed, setCheckoutClosed] = useState(false)
  const [initialCheckout, setInitialCheckout] = useState(false)
  useEffect(() => {
    initializePaddle({
      environment: paddleConfig.client.checkoutEnvironment,
      token: paddleConfig.client.token,
      eventCallback: (data) => {
        if (data.name === "checkout.completed") {
          console.log("Paddle: payment completed", data)
          if (!checkoutClosed) {
            setCheckoutClosed(true)
            setTimeout(() => {
              paddle?.Checkout.close()
            }, 1000)
          }
          setShowApplyingDialog("PURCHASE")
          setTimeout(() => {
            window.location.reload()
          }, 5000)
        }
        if (data.name === "checkout.closed") {
          console.log("Paddle: checkout closed")
          if (!checkoutClosed) {
            setCheckoutClosed(true)
          }
          if (initialCheckout) {
            setShowApplyingDialog("CANCEL")
            setTimeout(() => window.location.reload(), 5000)
          }
        }
      },
    }).then((instance) => setPaddle(instance))
  }, [checkoutClosed, paddle, initialCheckout])

  const openCheckout = async (params: CheckoutParams) => {
    if (!paddle) {
      alert("Paddle not initialized yet.")
      return
    }

    let priceId: string | undefined

    // 🧩 Special case: Upgrade from PRO → ULTIMATE one-time
    if (
      params.type === "PURCHASE" &&
      params.plan === "ULTIMATE" &&
      params.currentPlan?.type === "PURCHASE" &&
      params.currentPlan?.plan === "PRO"
    ) {
      priceId = paddleConfig.priceIds.PURCHASE.ULTIMATE_UPGRADE_FROM_PRO
    } else if (params.type === "SUBSCRIPTION") {
      priceId = paddleConfig.priceIds.SUBSCRIPTION[params.cycle][params.plan]
    } else {
      priceId = paddleConfig.priceIds.PURCHASE[params.plan]
    }

    if (!priceId) {
      console.error(`❌ Missing price ID for ${params.type} → ${params.plan}`)
      return
    }
    const organizationToken = await getOrganizationToken()
    setInitialCheckout(!!params.initial)
    setCheckoutClosed(false)
    paddle.Checkout.open({
      items: [{ priceId, quantity: params.quantity ?? 1 }],
      customData: {
        organizationToken,
      },
      settings: {
        displayMode: "overlay",
        theme: "light",
      },
    })
  }

  return { openCheckout, showApplyingDialog, setShowApplyingDialog }
}
