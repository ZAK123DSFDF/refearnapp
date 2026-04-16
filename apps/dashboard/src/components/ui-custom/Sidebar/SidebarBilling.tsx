// components/ui-custom/Sidebar/SidebarBilling.tsx
"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanInfo } from "@/lib/types/organization/planInfo"
import { UserLicense } from "@/lib/server/organization/getLicense"
import { polarConfig } from "@/lib/polarConfig"

interface SidebarBillingProps {
  orgId: string
  isSelfHosted: boolean
  plan: PlanInfo
  license: UserLicense | null
  onOpenLicenseModal: () => void
  onDeactivateLicense: () => void
  isDeactivating: boolean
  onOpenPortal: () => void
}

export const SidebarBilling = ({
  orgId,
  isSelfHosted,
  plan,
  license,
  onOpenLicenseModal,
  onDeactivateLicense,
  isDeactivating,
  onOpenPortal,
}: SidebarBillingProps) => {
  if (isSelfHosted) {
    return (
      <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">
            License
          </span>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            ULTIMATE
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight">
          Self-hosted instance with full premium access enabled.
        </p>
      </div>
    )
  }
  // Cloud Billing Logic
  return (
    <div className="space-y-2">
      {plan.plan === "FREE" && (
        <Button asChild className="w-full h-9">
          <Link href={`/organization/${orgId}/dashboard/pricing`}>Upgrade</Link>
        </Button>
      )}

      {plan.type === "PURCHASE" && plan.plan === "PRO" && (
        <Button asChild className="w-full h-9">
          <Link href={`/organization/${orgId}/dashboard/pricing`}>
            Get Ultimate
          </Link>
        </Button>
      )}

      {(plan.type === "SUBSCRIPTION" || plan.type === "EXPIRED") &&
        (plan.plan === "PRO" || plan.plan === "ULTIMATE") && (
          <>
            {!plan.hasPendingPurchase && (
              <Button className="w-full h-9" onClick={onOpenPortal}>
                Manage Subscription
              </Button>
            )}
            <Button asChild variant="outline" className="w-full h-9">
              <Link href={`/organization/${orgId}/dashboard/pricing`}>
                {plan.hasPendingPurchase ? "Purchase One-Time" : "Change Plan"}
              </Link>
            </Button>
          </>
        )}
    </div>
  )
}
