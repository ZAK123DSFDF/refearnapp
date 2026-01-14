"use client"

import React, { useState } from "react"
import {
  BillingType,
  SubscriptionCycle,
} from "@/components/ui-custom/Pricing/PricingClient"
import { PlanInfo } from "@/lib/types/planInfo"
import { FeatureList } from "@/lib/types/FeatureList"
import { PricingCard } from "@/components/ui-custom/Pricing/PricingCard"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import usePaddleCheckout from "@/hooks/usePaddleCheckout"
import { useAppMutation } from "@/hooks/useAppMutation"
import { updateSubscriptionAction } from "@/app/(organization)/organization/[orgId]/dashboard/pricing/action"
import { Loader2 } from "lucide-react"
import { PRICING_CONFIG } from "@/lib/types/priceConfig"

export function PricingGrid({
  billingType,
  dashboard,
  plan,
  subscriptionCycle,
  featuresList,
  getButtonText,
}: {
  billingType: BillingType
  dashboard: boolean
  plan?: PlanInfo | null
  subscriptionCycle?: SubscriptionCycle
  featuresList: FeatureList[]
  getButtonText: (p: PlanInfo["plan"], t: PlanInfo["type"]) => string
}) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [_, setIsUpgrading] = useState(false)
  const [pendingUpgrade, setPendingUpgrade] = useState<null | {
    subscriptionId: string
    targetPlan: Exclude<PlanInfo["plan"], "FREE">
    targetCycle?: SubscriptionCycle
    mode: "PRORATE" | "DO_NOT_BILL"
    modeType: "SUB_TO_SUB" | "SUB_TO_ONE_TIME"
  }>(null)
  const isLoggedIn = !!plan
  const { openCheckout, showApplyingDialog, setShowApplyingDialog } =
    usePaddleCheckout()
  const mutation = useAppMutation(updateSubscriptionAction, {
    onSuccess: (_, variables) => {
      console.log("Mutation done:", variables)
      if (variables.modeType === "SUB_TO_ONE_TIME") {
        openCheckout({
          type: "PURCHASE",
          plan: variables.targetPlan,
          currentPlan: plan?.hasPendingPurchase
            ? ({
                type: "PURCHASE",
                plan: plan.pendingPurchaseTier!,
              } satisfies Pick<PlanInfo, "plan" | "type">)
            : plan,
          initial: true,
        }).then(() => console.log("Checkout closed"))
      }
    },
  })
  const handleBuyClick = (targetPlan: PlanInfo["plan"]) => {
    if (targetPlan === "FREE") {
      // No checkout needed for Free tier
      return
    }

    const isSubscriptionMode = billingType === "SUBSCRIPTION"
    const isPurchaseMode = billingType === "PURCHASE"
    if (plan?.type === "EXPIRED") {
      const isSubscriptionMode = billingType === "SUBSCRIPTION"

      if (isSubscriptionMode) {
        openCheckout({
          type: "SUBSCRIPTION",
          plan: targetPlan,
          cycle: subscriptionCycle || "MONTHLY",
        }).then(() => console.log("Checkout closed"))
      } else {
        openCheckout({
          type: "PURCHASE",
          plan: targetPlan,
        }).then(() => console.log("Checkout closed"))
      }

      return
    }
    // 🧠 0. No active plan → directly open checkout
    if (!plan || plan.plan === "FREE") {
      if (isSubscriptionMode) {
        openCheckout({
          type: "SUBSCRIPTION",
          plan: targetPlan,
          cycle: subscriptionCycle || "MONTHLY",
        }).then(() => console.log("Checkout closed"))
      } else {
        openCheckout({ type: "PURCHASE", plan: targetPlan }).then(() =>
          console.log("Checkout closed")
        )
      }
      return
    }

    // 🧠 1. Handle active paid SUBSCRIPTION users (PRO or ULTIMATE)
    if (
      plan.type === "SUBSCRIPTION" &&
      (plan.plan === "PRO" || plan.plan === "ULTIMATE")
    ) {
      if (!plan.subscriptionId) {
        return
      }
      if (plan.subscriptionChangeAt && isPurchaseMode && targetPlan === "PRO") {
        openCheckout({
          type: "PURCHASE",
          plan: "PRO",
          currentPlan: plan,
        }).then(() => console.log("Checkout closed"))

        return
      }
      if (isSubscriptionMode) {
        setPendingUpgrade({
          subscriptionId: plan.subscriptionId,
          targetPlan,
          targetCycle: subscriptionCycle || "MONTHLY",
          mode: "PRORATE",
          modeType: "SUB_TO_SUB",
        })
        setDialogOpen(true)
        return
      }

      if (isPurchaseMode) {
        let mode: "PRORATE" | "DO_NOT_BILL" = "PRORATE"
        if (plan.plan === "ULTIMATE" && targetPlan === "PRO") {
          mode = "DO_NOT_BILL"
        }
        setPendingUpgrade({
          subscriptionId: plan.subscriptionId,
          targetPlan,
          mode,
          modeType: "SUB_TO_ONE_TIME",
        })
        setDialogOpen(true)
        return
      }
    }

    // 🧠 3. Fallback: open checkout normally
    if (isSubscriptionMode) {
      openCheckout({
        type: "SUBSCRIPTION",
        plan: targetPlan,
        cycle: subscriptionCycle || "MONTHLY",
      }).then(() => console.log("Checkout closed"))
    } else {
      openCheckout({
        type: "PURCHASE",
        plan: targetPlan,
        currentPlan: plan,
      }).then(() => console.log("Checkout closed"))
    }
  }
  const getPrice = (tier: PlanInfo["plan"]) => {
    if (tier === "FREE") return "$0"
    if (billingType === "SUBSCRIPTION") {
      const monthlyPrice =
        tier === "PRO"
          ? PRICING_CONFIG.SUBSCRIPTION.PRO.MONTHLY
          : PRICING_CONFIG.SUBSCRIPTION.ULTIMATE.MONTHLY
      if (subscriptionCycle === "MONTHLY") return `$${monthlyPrice} / month`
      if (subscriptionCycle === "YEARLY") {
        const yearlyPrice =
          tier === "PRO"
            ? Math.round(PRICING_CONFIG.SUBSCRIPTION.PRO.YEARLY / 12)
            : Math.round(PRICING_CONFIG.SUBSCRIPTION.ULTIMATE.YEARLY / 12)
        return `$${yearlyPrice} / month`
      }
    } else {
      const proPrice = PRICING_CONFIG.PURCHASE.PRO
      const ultimatePrice = PRICING_CONFIG.PURCHASE.ULTIMATE
      if (tier === "PRO") return `$${proPrice} one-time`
      if (tier === "ULTIMATE") {
        const proOwned =
          (plan?.type === "PURCHASE" && plan.plan === "PRO") ||
          (plan?.hasPendingPurchase && plan.pendingPurchaseTier === "PRO")

        if (proOwned) {
          const upgradePrice = ultimatePrice - proPrice
          return `$${upgradePrice} upgrade`
        }

        return `$${ultimatePrice} one-time`
      }
    }
    return "-"
  }
  const getYearlySavings = (tier: PlanInfo["plan"]) => {
    if (
      billingType !== "SUBSCRIPTION" ||
      subscriptionCycle !== "YEARLY" ||
      tier === "FREE"
    ) {
      return null
    }

    const config =
      tier === "PRO"
        ? PRICING_CONFIG.SUBSCRIPTION.PRO
        : PRICING_CONFIG.SUBSCRIPTION.ULTIMATE
    const totalMonthlyCost = config.MONTHLY * 12
    const savings = totalMonthlyCost - config.YEARLY

    return savings > 0 ? savings : null
  }
  function getDialogMessage(
    plan: PlanInfo | null,
    pending: NonNullable<typeof pendingUpgrade>
  ) {
    // 1️⃣ SUBSCRIPTION → SUBSCRIPTION
    if (pending.modeType === "SUB_TO_SUB") {
      if (!plan) return ""

      const upgrade = pending.targetPlan !== plan.plan

      if (upgrade) {
        return `You are upgrading from ${plan.plan} (${plan.cycle?.toLowerCase()}) to ${pending.targetPlan} (${pending.targetCycle?.toLowerCase()}).

Your subscription will be updated immediately and proration will be applied.`
      }

      // Same tier but switching cycles (e.g. monthly → yearly)
      return `You are switching your ${plan.plan} subscription from ${plan.cycle?.toLowerCase()} to ${pending.targetCycle?.toLowerCase()}.

Your billing will be adjusted accordingly.`
    }

    // 2️⃣ SUB → ONE-TIME (your previous logic)
    if (pending.modeType === "SUB_TO_ONE_TIME") {
      const isUltimateToPro =
        plan?.plan === "ULTIMATE" && pending.targetPlan === "PRO"
      const isProToUltimate =
        plan?.plan === "PRO" && pending.targetPlan === "ULTIMATE"
      const isSameTier = plan?.plan === pending.targetPlan

      if (isUltimateToPro) {
        return `Your current ULTIMATE subscription will remain active until the end of the billing period.
Are you sure you want to buy the PRO one-time plan?`
      }

      if (isProToUltimate) {
        return `Your PRO subscription will be cancelled immediately.
Are you sure you want to buy the ULTIMATE one-time plan?`
      }

      if (isSameTier) {
        return `Your subscription will be cancelled immediately and replaced with the one-time plan.

Proceed?`
      }

      return `Upgrade to ${pending.targetPlan} one-time?`
    }

    return ""
  }

  const isDisabled = (targetPlan: PlanInfo["plan"]) => {
    // No plan → always enabled
    if (!plan) return false
    if (
      billingType === "PURCHASE" &&
      ((plan?.type === "PURCHASE" && plan.plan === "ULTIMATE") ||
        (plan?.hasPendingPurchase &&
          plan.pendingPurchaseTier === "ULTIMATE")) &&
      targetPlan === "PRO"
    ) {
      return true
    }
    if (
      plan.hasPendingPurchase &&
      billingType === "PURCHASE" &&
      plan.pendingPurchaseTier === targetPlan
    ) {
      return true
    }

    // Different billing type → enable (e.g. switching sub <-> purchase)
    if (plan.type !== billingType) return false

    // If target is lower (downgrade) → never disable
    if (targetPlan === "PRO" && plan.plan === "ULTIMATE") {
      return false
    }

    // If Ultimate: disable only if SAME cycle and target is Ultimate
    if (plan.plan === "ULTIMATE") {
      return targetPlan === "ULTIMATE" && plan.cycle === subscriptionCycle
    }

    // If PRO: disable only if same plan AND same cycle
    if (plan.plan === "PRO" && targetPlan === "PRO") {
      return plan.cycle === subscriptionCycle
    }

    return false
  }
  const handlePlanClick = (plan: PlanInfo["plan"]) => {
    if (!dashboard && !isLoggedIn) {
      window.location.href = "/signup"
      return
    }
    handleBuyClick(plan)
  }
  return (
    <>
      <div className="flex flex-wrap justify-center w-full gap-6">
        <PricingCard
          title="Pro"
          price={getPrice("PRO")}
          features={featuresList.filter((f) => f.pro).map((f) => f.name)}
          buttonText={
            dashboard ? getButtonText("PRO", billingType) : "Start 14-Day Trial"
          }
          yearlySavings={getYearlySavings("PRO")}
          disabled={isDisabled("PRO")}
          pendingMessage={
            plan?.hasPendingPurchase && plan.pendingPurchaseTier === "PRO"
              ? "This one-time payment will be applied when your subscription ends."
              : undefined
          }
          onClick={() => handlePlanClick("PRO")}
        />

        <PricingCard
          title="Ultimate"
          price={getPrice("ULTIMATE")}
          yearlySavings={getYearlySavings("ULTIMATE")}
          pendingMessage={
            plan?.hasPendingPurchase && plan.pendingPurchaseTier === "ULTIMATE"
              ? "This one-time payment will be applied when your subscription ends."
              : undefined
          }
          features={featuresList.filter((f) => f.ultimate).map((f) => f.name)}
          buttonText={
            dashboard
              ? getButtonText("ULTIMATE", billingType)
              : "Start 14-Day Trial"
          }
          disabled={isDisabled("ULTIMATE")}
          highlight
          onClick={() => handlePlanClick("ULTIMATE")}
        />
      </div>

      {/* ⚙️ AppDialog Integration */}
      <AppDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Confirm Upgrade"
        description={
          pendingUpgrade ? getDialogMessage(plan ?? null, pendingUpgrade) : ""
        }
        confirmText="Upgrade Now"
        confirmLoading={mutation.isPending}
        onConfirm={() => {
          const upgrade = pendingUpgrade
          if (!upgrade) return

          setIsUpgrading(true)

          mutation.mutate(upgrade, {
            onSuccess: () => {
              setDialogOpen(false)
              setPendingUpgrade(null)
              if (upgrade.modeType === "SUB_TO_SUB") {
                setShowApplyingDialog("PURCHASE")
                setTimeout(() => {
                  window.location.reload()
                }, 5000)
              }
            },
          })
        }}
        affiliate={false}
      />
      <AppDialog
        open={!!showApplyingDialog}
        onOpenChange={() => {}}
        title="Applying changes..."
        description={
          showApplyingDialog === "PURCHASE"
            ? "Your purchase was successful. Updating your account..."
            : showApplyingDialog === "CANCEL"
              ? "Cancelling your subscription. Updating your account..."
              : "Applying changes..."
        }
        hideCloseIcon={true}
        showFooter={false}
        affiliate={false}
      >
        <div className="flex items-center gap-3 py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>
            {showApplyingDialog === "PURCHASE"
              ? "Updating your plan..."
              : showApplyingDialog === "CANCEL"
                ? "Processing cancellation..."
                : "Updating your account..."}
          </span>
        </div>
      </AppDialog>
    </>
  )
}
