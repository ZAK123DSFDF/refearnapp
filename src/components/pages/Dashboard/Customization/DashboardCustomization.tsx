"use client"

import React from "react"
import AffiliateDashboardSidebar from "@/components/AffiliateDashboardSidebar"
import Profile from "@/components/pages/Dashboard/Profile/Profile"
import PaymentTable from "@/components/pages/AffiliateDashboard/Payment/Payment"
import Links from "@/components/pages/AffiliateDashboard/Links/Links"
import { dummyProfileData } from "@/lib/types/previewData"
import AffiliateOverview from "@/components/pages/AffiliateDashboard/AffiliateOverview/AffiliateOverview"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { useAtomValue } from "jotai"
import { dashboardThemeCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import { MissingPaypalEmailCard } from "@/components/ui-custom/MissingPayoutEmailCard"
import { showMissingPaypalAtom } from "@/store/MissingPaypalAtom"
import { DomainHeader } from "@/components/ui-custom/DomainHeader"

export function DashboardCustomization({
  orgId,
  domain,
  selectedPage,
  setSelectedPage,
}: {
  orgId: string
  domain?: string
  selectedPage: string
  setSelectedPage: (selectedPage: string) => void
}) {
  const { mainBackgroundColor } = useAtomValue(dashboardThemeCustomizationAtom)
  const showMissingPaypal = useAtomValue(showMissingPaypalAtom)
  if (!orgId) {
    return <div className="text-red-500">Invalid organization ID</div>
  }
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 transition-all  duration-300 mt-6 shadow-md">
        {domain && (
          <DomainHeader
            domain={domain}
            route={
              selectedPage === "dashboard"
                ? `/${selectedPage}`
                : `/dashboard/${selectedPage}`
            }
            className="mb-4"
          />
        )}
        <div className="border rounded-xl overflow-hidden shadow-lg ring ring-muted bg-background max-w-5xl h-[500px] mx-auto relative">
          <div className="flex h-full">
            <AffiliateDashboardSidebar
              affiliate
              orgId={orgId}
              isPreview
              currentPage={selectedPage}
              onSelectPage={(page: any) => setSelectedPage(page)}
            />
            <div
              className="flex-1 p-6 overflow-y-auto"
              style={{
                backgroundColor: mainBackgroundColor || undefined,
              }}
            >
              <DashboardThemeCustomizationOptions name="mainBackgroundColor" />
              {selectedPage === "dashboard" && (
                <div className="space-y-6">
                  {showMissingPaypal && (
                    <MissingPaypalEmailCard
                      orgId={orgId}
                      affiliate
                      isPreview
                      onOpenProfile={() => setSelectedPage("profile")}
                    />
                  )}
                  <AffiliateOverview orgId={orgId} affiliate isPreview />
                </div>
              )}
              {selectedPage === "links" && (
                <div className="space-y-6">
                  {showMissingPaypal && (
                    <MissingPaypalEmailCard
                      orgId={orgId}
                      affiliate
                      isPreview
                      onOpenProfile={() => setSelectedPage("profile")}
                    />
                  )}
                  <Links orgId={orgId} affiliate isPreview />
                </div>
              )}
              {selectedPage === "payment" && (
                <div className="space-y-6">
                  {showMissingPaypal && (
                    <MissingPaypalEmailCard
                      orgId={orgId}
                      affiliate
                      isPreview
                      onOpenProfile={() => setSelectedPage("profile")}
                    />
                  )}
                  <PaymentTable orgId={orgId} affiliate isPreview />
                </div>
              )}
              {selectedPage === "profile" && (
                <Profile
                  orgId={orgId}
                  affiliate
                  AffiliateData={dummyProfileData}
                  isPreview
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
