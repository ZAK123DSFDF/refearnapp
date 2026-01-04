"use client"

import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { PlanInfo } from "@/lib/types/planInfo"
import { featuresList } from "@/util/FeatureList"
import { SubscriptionSection } from "@/components/ui-custom/Pricing/SubscriptionSection"
import { PricingGrid } from "@/components/ui-custom/Pricing/PricingGrid"
import { getResponsiveTabSize } from "@/util/GetResponsiveTabSize"

export type BillingType = "SUBSCRIPTION" | "PURCHASE"
export type SubscriptionCycle = "MONTHLY" | "YEARLY"
type PricingClientProps = {
  dashboard?: boolean
  plan?: PlanInfo | null
  showSubscription?: boolean
  showPurchase?: boolean
}

export default function PricingClient({
  dashboard = false,
  plan,
  showSubscription = true,
  showPurchase = true,
}: PricingClientProps) {
  const [activeTab, setActiveTab] = useState<BillingType>("PURCHASE")
  const [subscriptionCycle, setSubscriptionCycle] =
    useState<SubscriptionCycle>("MONTHLY")

  const isCurrentPlan = (targetPlan: PlanInfo["plan"]) =>
    plan?.plan === targetPlan

  const getButtonText = (
    targetPlan: PlanInfo["plan"],
    billingType: BillingType
  ) => {
    if (!plan) return "Select Plan"

    const currentPlan = plan.plan
    const currentType = plan.type

    // 🔒 1. Handle expired subscriptions
    if (currentType === "EXPIRED") {
      // 🧩 Free Expired — always show upgrade options
      if (currentPlan === "FREE") {
        if (billingType === "SUBSCRIPTION") {
          if (targetPlan === "PRO") return "Upgrade to Pro"
          if (targetPlan === "ULTIMATE") return "Upgrade to Ultimate"
        }
        if (billingType === "PURCHASE") {
          if (targetPlan === "PRO") return "Buy Pro Bundle"
          if (targetPlan === "ULTIMATE") return "Buy Ultimate Bundle"
        }
        return "Upgrade Plan"
      }

      // 🧩 Pro / Ultimate Expired (subscription expired)
      if (billingType === "SUBSCRIPTION") {
        if (targetPlan === "PRO") return "Upgrade to Pro"
        if (targetPlan === "ULTIMATE") return "Upgrade to Ultimate"
        return "Upgrade Plan"
      }

      // 🧩 Expired, but viewing purchase tab
      if (billingType === "PURCHASE") {
        if (targetPlan === "PRO") return "Buy Pro Bundle"
        if (targetPlan === "ULTIMATE") return "Buy Ultimate Bundle"
      }
    }

    // 🆓 2. Completely FREE plan (active)
    if (currentType === "FREE" || currentPlan === "FREE") {
      if (billingType === "SUBSCRIPTION") {
        if (targetPlan === "PRO") return "Upgrade to Pro"
        if (targetPlan === "ULTIMATE") return "Upgrade to Ultimate"
      }
      if (billingType === "PURCHASE") {
        if (targetPlan === "PRO") return "Buy Pro Bundle"
        if (targetPlan === "ULTIMATE") return "Buy Ultimate Bundle"
      }
    }

    // 🟢 3. Active matching plans
    if (
      currentPlan === targetPlan &&
      ((currentType === "SUBSCRIPTION" && billingType === "SUBSCRIPTION") ||
        (currentType === "PURCHASE" && billingType === "PURCHASE"))
    ) {
      if (plan.cycle !== subscriptionCycle) {
        return `Upgrade to ${currentPlan === "PRO" ? "Pro" : "Ultimate"}`
      }
      return "Current Plan"
    }

    // 💳 4. Subscription logic (user viewing subscription tab)
    if (billingType === "SUBSCRIPTION") {
      if (currentType === "PURCHASE") return "Switch to Subscription"

      if (targetPlan === "PRO" && currentPlan === "FREE")
        return "Upgrade to Pro"
      if (targetPlan === "ULTIMATE" && currentPlan !== "ULTIMATE")
        return "Upgrade to Ultimate"
      if (
        currentPlan === "ULTIMATE" &&
        targetPlan === "PRO" &&
        billingType === "SUBSCRIPTION"
      ) {
        // Same cycle → switching plan only
        if (plan.cycle === subscriptionCycle) {
          return "Switch to Pro"
        }
        return "Upgrade to Pro"
      }
      return "Upgrade Plan"
    }

    // 💰 5. One-time purchase logic (user viewing bundles tab)
    if (billingType === "PURCHASE") {
      if (
        plan.hasPendingPurchase &&
        plan.pendingPurchaseTier === "PRO" &&
        targetPlan === "ULTIMATE"
      ) {
        return "Upgrade to Ultimate ($100)"
      }
      if (currentType === "PURCHASE") {
        if (currentPlan === "PRO" && targetPlan === "ULTIMATE")
          return "Upgrade to Ultimate ($100)"
      }

      if (currentType === "SUBSCRIPTION" || currentType === "EXPIRED") {
        if (targetPlan === "PRO") return "Buy Pro Bundle"
        if (targetPlan === "ULTIMATE") return "Buy Ultimate Bundle"
      }

      if (targetPlan === "PRO" && currentPlan !== "PRO") return "Buy Pro Bundle"
      if (targetPlan === "ULTIMATE" && currentPlan !== "ULTIMATE")
        return "Buy Ultimate Bundle"
    }

    return "Upgrade Plan"
  }

  const showBothTabs = showSubscription && showPurchase

  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Choose Your Plan</h1>

      {showBothTabs ? (
        // 🌟 Show Top Tabs (One-Time / Subscription)
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as BillingType)}
          className="w-full flex flex-col items-center"
        >
          <TabsList className="flex justify-center gap-4 px-4 mb-8 py-10 bg-gray-100 rounded-xl">
            <TabsTrigger
              value="PURCHASE"
              className={cn(
                getResponsiveTabSize(1),
                "font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2",
                activeTab === "PURCHASE"
                  ? "bg-primary text-white shadow-md scale-[1.02]"
                  : "text-gray-700 hover:bg-gray-200/60 hover:scale-[1.03]"
              )}
            >
              One-Time{" "}
              <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded-md">
                Special Offer
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="SUBSCRIPTION"
              className={cn(
                getResponsiveTabSize(1),
                "font-medium rounded-lg transition-all duration-200",
                activeTab === "SUBSCRIPTION"
                  ? "bg-primary text-white shadow-md scale-[1.02]"
                  : "text-gray-700 hover:bg-gray-200/60 hover:scale-[1.03]"
              )}
            >
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="PURCHASE" className="w-full">
            <PricingGrid
              billingType="PURCHASE"
              dashboard={dashboard}
              plan={plan}
              featuresList={featuresList}
              getButtonText={(plan) => getButtonText(plan, "PURCHASE")}
            />
          </TabsContent>

          <TabsContent value="SUBSCRIPTION" className="w-full">
            <SubscriptionSection
              dashboard={dashboard}
              plan={plan}
              featuresList={featuresList}
              getButtonText={(plan) => getButtonText(plan, "SUBSCRIPTION")}
              subscriptionCycle={subscriptionCycle}
              setSubscriptionCycle={setSubscriptionCycle}
            />
          </TabsContent>
        </Tabs>
      ) : showSubscription ? (
        // 💳 Only Subscription (no tabs)
        <SubscriptionSection
          dashboard={dashboard}
          plan={plan}
          featuresList={featuresList}
          getButtonText={(plan) => getButtonText(plan, "SUBSCRIPTION")}
          subscriptionCycle={subscriptionCycle}
          setSubscriptionCycle={setSubscriptionCycle}
        />
      ) : (
        // 💰 Only One-Time (no tabs)
        <PricingGrid
          billingType="PURCHASE"
          dashboard={dashboard}
          plan={plan}
          featuresList={featuresList}
          getButtonText={(plan) => getButtonText(plan, "PURCHASE")}
        />
      )}
    </main>
  )
}
