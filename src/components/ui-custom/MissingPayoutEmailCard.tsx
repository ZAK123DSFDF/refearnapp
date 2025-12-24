"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getAffiliatePaymentMethod } from "@/app/affiliate/[orgId]/dashboard/profile/action"
import { ActionResult } from "@/lib/types/response"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { cn } from "@/lib/utils"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import React from "react"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import {
  dashboardButtonCustomizationAtom,
  dashboardThemeCustomizationAtom,
} from "@/store/DashboardCustomizationAtom"
import { useAtomValue } from "jotai"
import { DashboardButtonCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardButtonCustomizationOptions"
import { useAffiliatePath } from "@/hooks/useUrl"
type MissingPaypalEmailCardProps = {
  orgId: string
  affiliate: boolean
  isPreview?: boolean
  onOpenProfile?: () => void
}
export function MissingPaypalEmailCard({
  orgId,
  affiliate,
  isPreview = false,
  onOpenProfile,
}: MissingPaypalEmailCardProps) {
  const dashboardCardStyle = useDashboardCard(affiliate)
  const { goTo } = useAffiliatePath(orgId)
  const { missingPaypalHeaderColor, missingPaypalDescriptionColor } =
    useAtomValue(dashboardThemeCustomizationAtom)
  const { dashboardButtonTextColor, dashboardButtonBackgroundColor } =
    useAtomValue(dashboardButtonCustomizationAtom)
  const { data, isLoading } = useQuery<ActionResult<AffiliatePaymentMethod>>({
    queryKey: ["affiliatePaymentMethod", orgId],
    queryFn: () => getAffiliatePaymentMethod(orgId), // pass orgId here
    enabled: !!(!isPreview && affiliate && orgId),
  })

  if (isLoading) return null
  if (!isPreview && (!data?.ok || data.data?.paypalEmail)) return null

  const handleAddPayPal = () => {
    if (isPreview && typeof onOpenProfile === "function") {
      onOpenProfile()
      return
    }
    goTo("dashboard/profile")
  }
  return (
    <Card
      className={cn("relative", isPreview && "mt-2")}
      style={dashboardCardStyle}
    >
      {isPreview && affiliate && (
        <div className="absolute bottom-0 left-0 p-2">
          <DashboardCardCustomizationOptions
            triggerSize="w-6 h-6"
            dropdownSize="w-[150px]"
          />
        </div>
      )}
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle
            style={{
              color: affiliate ? missingPaypalHeaderColor : undefined,
            }}
          >
            No PayPal Email Added
          </CardTitle>
          {isPreview && affiliate && (
            <DashboardThemeCustomizationOptions
              name="missingPaypalHeaderColor"
              showLabel={false}
              buttonSize="w-4 h-4"
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2">
          <p
            className="text-sm text-muted-foreground"
            style={{
              color: affiliate ? missingPaypalDescriptionColor : undefined,
            }}
          >
            You haven’t added a PayPal email yet. Please add one to receive
            payouts.
          </p>
          {isPreview && affiliate && (
            <DashboardThemeCustomizationOptions
              name="missingPaypalDescriptionColor"
              showLabel={false}
              buttonSize="w-4 h-4"
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            className={cn("mt-4", isPreview && "mb-4")}
            onClick={handleAddPayPal}
            style={{
              backgroundColor: affiliate
                ? dashboardButtonBackgroundColor
                : undefined,
              color: affiliate ? dashboardButtonTextColor : undefined,
            }}
          >
            Add PayPal Email
          </Button>
          {isPreview && affiliate && (
            <DashboardButtonCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[150px]"
              onlyShowEnabled
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
