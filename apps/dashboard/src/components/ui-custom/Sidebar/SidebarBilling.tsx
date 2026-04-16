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
      <div className="space-y-2">
        {license?.isCommunity && (
          <>
            <Button asChild className="w-full h-9 text-xs">
              <Link href={`/organization/${orgId}/dashboard/pricing`}>
                Get License Key
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full text-[10px] h-6 opacity-60"
              onClick={onOpenLicenseModal}
            >
              Activate existing key
            </Button>
          </>
        )}

        {(license?.isPro || license?.isUltimate) && (
          <>
            <Button
              variant="outline"
              className="w-full h-8 text-xs"
              onClick={() =>
                window.open(polarConfig.customerPortalUrl, "_blank")
              }
            >
              Manage Licenses
            </Button>
            {license.activationId ? (
              <Button
                variant="destructive"
                className="w-full h-8 text-xs"
                disabled={isDeactivating}
                onClick={onDeactivateLicense}
              >
                {isDeactivating ? "..." : `Deactivate ${license.tier}`}
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="w-full h-8 text-xs"
                onClick={onOpenLicenseModal}
              >
                Activate Key
              </Button>
            )}
          </>
        )}
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
