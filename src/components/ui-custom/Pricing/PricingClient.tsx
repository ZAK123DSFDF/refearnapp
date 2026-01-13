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
          className="mb-12 flex w-full flex-col items-center gap-6 px-2"
        >
          <TabsList className="relative flex w-full max-w-[340px] items-center justify-center rounded-2xl border border-border bg-gray-200/50 p-1 h-14 md:max-w-md md:h-16 md:p-1.5">
            <div className="absolute -top-4 -left-2 z-10 md:-left-6">
              <span className="inline-block -rotate-12 transform rounded-lg border-2 border-white bg-yellow-400 px-3 py-1 text-[10px] font-black tracking-wider text-black uppercase shadow-lg md:text-xs">
                Special Offer
              </span>
            </div>
            <TabsTrigger
              value="PURCHASE"
              className={cn(
                getResponsiveTabSize(1),
                "flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all md:px-8 md:py-3 md:text-base",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600",
                activeTab === "PURCHASE"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600"
              )}
            >
              One-Time{" "}
            </TabsTrigger>

            <TabsTrigger
              value="SUBSCRIPTION"
              className={cn(
                getResponsiveTabSize(1),
                "flex flex-1 items-center justify-center rounded-xl px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-all md:px-8 md:py-3 md:text-base",
                "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md text-slate-600",
                activeTab === "SUBSCRIPTION"
                  ? "bg-primary text-white shadow-md"
                  : "text-slate-600"
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
