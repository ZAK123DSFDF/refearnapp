// hooks/usePolarCheckout.ts
"use client"
import { useRef, useState } from "react"
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed"
import { PlanInfo } from "@/lib/types/organization/planInfo"
import { createPolarCheckoutAction } from "@/app/(organization)/organization/[orgId]/dashboard/pricing/polarActions"

type CheckoutParams =
  | { type: "PURCHASE"; plan: "PRO" | "ULTIMATE"; currentPlan?: PlanInfo | null; quantity?: number; initial?: boolean }
  | { type: "SUBSCRIPTION"; plan: "PRO" | "ULTIMATE"; cycle: "MONTHLY" | "YEARLY"; quantity?: number; initial?: boolean }
type ApplyingReason = "PURCHASE" | "CANCEL" | "UPGRADE"

export default function usePolarCheckout() {
  const [showApplyingDialog, setShowApplyingDialog] = useState<null | ApplyingReason>(null)
  const completed = useRef(false)

  const openCheckout = async (params: CheckoutParams) => {
    const res = await createPolarCheckoutAction(
      params.type === "SUBSCRIPTION"
        ? { type: "SUBSCRIPTION", plan: params.plan, cycle: params.cycle }
        : { type: "PURCHASE", plan: params.plan }
    )
    const url = res?.data?.url
    if (!res?.ok || !url) return

    completed.current = false
    const checkout = await PolarEmbedCheckout.create(url, { theme: "light" })

    checkout.addEventListener("success", () => {
      completed.current = true
      setShowApplyingDialog("PURCHASE")
      setTimeout(() => window.location.reload(), 5000)
    })
    checkout.addEventListener("close", () => {
      if (!completed.current && params.initial) {
        setShowApplyingDialog("CANCEL")
        setTimeout(() => window.location.reload(), 5000)
      }
    })
  }

  return { openCheckout, showApplyingDialog, setShowApplyingDialog }
}
