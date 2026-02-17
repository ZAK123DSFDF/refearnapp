"use client"

import { Card, CardContent, CardTitle } from "@/components/ui/card"
import MonthSelect from "@/components/ui-custom/MonthSelect"
import {
  getDummyAffiliateStats,
  initialKpiData,
} from "@/lib/types/analytics/dummyKpiData"
import React, { useEffect, useState } from "react"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { YearSelectCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/YearSelectCustomizationOptions"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import { cn } from "@/lib/utils"
import { KpiCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/KpiCardCustomizationOptions"
import {
  AffiliateKpiStats,
  OrganizationKpiStats,
} from "@/lib/types/affiliate/affiliateKpiStats"
import { mapAffiliateStats, mapOrganizationStats } from "@/util/mapStats"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { formatValue } from "@/util/FormatValue"
import { useAtomValue } from "jotai"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover"
import {
  dashboardThemeCustomizationAtom,
  kpiCardCustomizationAtom,
} from "@/store/DashboardCustomizationAtom"
import { useAppQuery } from "@/hooks/useAppQuery"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { api } from "@/lib/apiClient"

interface CardsProps {
  orgId: string
  affiliate: boolean
  isPreview?: boolean
  isTeam?: boolean
}

const affiliateColorPairs = [
  { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { iconBg: "bg-green-100", iconColor: "text-green-600" },
  { iconBg: "bg-purple-100", iconColor: "text-purple-600" },
]

const organizationColorPairs = [
  { iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { iconBg: "bg-green-100", iconColor: "text-green-600" },
  { iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
]

const Cards = ({
  orgId,
  affiliate = false,
  isPreview = false,
  isTeam = false,
}: CardsProps) => {
  const { cardHeaderPrimaryTextColor } = useAtomValue(
    dashboardThemeCustomizationAtom
  )
  useVerifyTeamSession(orgId, isTeam)
  const previewSimulation = useAtomValue(previewSimulationAtom)
  const dashboardCardStyle = useDashboardCard(affiliate)
  const kpiCard = useAtomValue(kpiCardCustomizationAtom)
  const { filters, setFilters } = useQueryFilter({
    yearKey: "kpiYear",
    monthKey: "kpiMonth",
  })

  const {
    data: affiliateSearchData,
    error: affiliateError,
    isPending: affiliateSearchPending,
  } = useAppQuery(
    ["affiliate-card", orgId, filters.year, filters.month],
    (id, year, month) =>
      api.affiliate.dashboard.analytics.kpi([id, year, month]),
    [orgId, filters.year, filters.month] as const,
    {
      enabled: !!(affiliate && orgId && !isPreview),
    }
  )
  const {
    data: organizationSearchData,
    error: organizationError,
    isPending: organizationSearchPending,
  } = useAppQuery(
    [
      isTeam ? "team-card" : "organization-card",
      orgId,
      filters.year,
      filters.month,
    ],
    (id, year, month) =>
      isTeam
        ? api.organization.teams.dashboard.analytics.kpi([id, year, month])
        : api.organization.dashboard.analytics.kpi([id, year, month]),
    [orgId, filters.year, filters.month] as const,
    {
      enabled: !!(!affiliate && orgId && !isPreview),
    }
  )
  const searchError = affiliate ? affiliateError : organizationError
  const searchData = affiliate ? affiliateSearchData : organizationSearchData
  const searchPending = affiliate
    ? affiliateSearchPending
    : organizationSearchPending
  const filteredData = affiliate
    ? affiliateSearchData?.[0]
      ? mapAffiliateStats(affiliateSearchData[0] as AffiliateKpiStats)
      : []
    : organizationSearchData?.[0]
      ? mapOrganizationStats(organizationSearchData[0] as OrganizationKpiStats)
      : []

  const isFiltering = !!(filters.year || filters.month)
  const [previewLoading, setPreviewLoading] = useState(isPreview)
  useEffect(() => {
    if (isPreview) {
      const timer = setTimeout(() => setPreviewLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isPreview])
  const { data: currency = "USD" } = useAppQuery(
    ["org-currency", orgId],
    (id) => {
      const context = affiliate ? "affiliate" : isTeam ? "team" : "admin"
      return api.organization.currency([id, context])
    },
    [orgId] as const,
    { enabled: !!orgId }
  )
  const displayCurrency = React.useMemo(() => {
    const dataCurrency = affiliate
      ? (affiliateSearchData?.[0] as AffiliateKpiStats)?.currency
      : (organizationSearchData?.[0] as OrganizationKpiStats)?.currency

    return dataCurrency || currency
  }, [affiliate, affiliateSearchData, organizationSearchData, currency])
  const displayData = React.useMemo(() => {
    if (isPreview) {
      if (previewSimulation === "empty") return []
      return mapAffiliateStats(getDummyAffiliateStats(displayCurrency))
    }

    if (isFiltering) {
      if (searchPending) return []
      if (searchData)
        return affiliate
          ? mapAffiliateStats(searchData[0] as AffiliateKpiStats)
          : mapOrganizationStats(searchData[0] as OrganizationKpiStats) ||
              initialKpiData
    }

    return filteredData
  }, [isPreview, isFiltering, searchPending, searchData, filteredData])

  const colorTypes = ["Primary", "Secondary", "Tertiary"] as const
  const colorPairs = affiliate ? affiliateColorPairs : organizationColorPairs

  return (
    <div className="space-y-6">
      <Card
        className={cn(isPreview && "mt-2", "relative")}
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
        {isPreview && affiliate && (
          <div className="absolute bottom-0 right-0 p-2">
            <KpiCardCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[180px]"
            />
          </div>
        )}

        <CardContent className={cn("space-y-6 pt-6", isPreview && "pb-10")}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <CardTitle
              style={{
                color: (affiliate && cardHeaderPrimaryTextColor) || undefined,
              }}
              className="text-lg"
            >
              <div className="flex flex-row items-center gap-2">
                <h2 className="text-lg font-semibold">Performance Overview</h2>
                {isPreview && (
                  <DashboardThemeCustomizationOptions
                    name="cardHeaderPrimaryTextColor"
                    buttonSize="w-4 h-4"
                  />
                )}
              </div>
            </CardTitle>
            <div className="flex flex-row gap-2 items-center">
              {isPreview && (
                <YearSelectCustomizationOptions triggerSize="w-6 h-6" />
              )}
              <MonthSelect
                value={{ year: filters.year, month: filters.month }}
                onChange={(year, month) => setFilters({ year, month })}
                affiliate={affiliate}
              />
            </div>
          </div>

          <div
            className={`grid ${
              isPreview
                ? "grid-cols-2 sm:grid-cols-3 gap-2"
                : affiliate
                  ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            }`}
          >
            {(isPreview &&
              (previewLoading || previewSimulation === "loading")) ||
            (!isPreview && searchPending) ? (
              Array.from({ length: affiliate ? 3 : 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse p-3 rounded-lg bg-gray-100 h-20"
                  style={{
                    backgroundColor:
                      (affiliate && kpiCard.kpiLoadingColor) ||
                      "rgb(243 244 246)",
                  }}
                />
              ))
            ) : (isPreview && previewSimulation === "error") || searchError ? (
              // Error message
              <div
                className="col-span-full text-center py-10 text-red-500"
                style={{ color: affiliate ? kpiCard.kpiErrorColor : undefined }}
              >
                {searchError || "Simulated preview error loading data."}
              </div>
            ) : displayData.length === 0 ? (
              // Empty state
              <div
                className="col-span-full text-center py-10 text-muted-foreground"
                style={{
                  color: affiliate ? kpiCard.kpiEmptyTextColor : undefined,
                }}
              >
                No data available.
              </div>
            ) : (
              displayData.map(({ label, value, icon: Icon }, index) => {
                const colorIndex = index % colorPairs.length
                const defaultColorPair = colorPairs[colorIndex]
                const currentCurrency = displayCurrency
                if (!affiliate) {
                  return (
                    <div
                      key={label}
                      className={cn(
                        "p-3 flex items-center gap-4 rounded-lg bg-white border shadow-sm",
                        isPreview ? "text-sm" : "text-base"
                      )}
                    >
                      <div
                        className={cn(
                          "flex-shrink-0 rounded-xl flex items-center justify-center",
                          isPreview ? "w-8 h-8" : "p-3",
                          defaultColorPair.iconBg
                        )}
                      >
                        <Icon
                          className={cn(
                            isPreview ? "w-4 h-4" : "w-8 h-8",
                            defaultColorPair.iconColor
                          )}
                        />
                      </div>
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="space-y-1 overflow-hidden cursor-pointer">
                            <div className="text-muted-foreground font-medium truncate">
                              {label}
                            </div>
                            <div className="font-bold leading-tight truncate">
                              {formatValue(
                                label,
                                value as number,
                                currentCurrency
                              )}
                            </div>
                          </div>
                        </PopoverTrigger>

                        <PopoverContent className="w-fit p-3 rounded-md shadow-lg border bg-white">
                          <div className="text-sm font-semibold">{label}</div>
                          <div className="text-base font-bold mt-1">
                            {formatValue(
                              label,
                              value as number,
                              currentCurrency
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  )
                }

                const colorType = colorTypes[colorIndex % colorTypes.length]
                const iconBgColor: string | undefined =
                  (kpiCard[
                    `cardIcon${colorType}BackgroundColor` as keyof typeof kpiCard
                  ] as unknown as string | undefined) ||
                  (affiliate && defaultColorPair.iconBg) ||
                  undefined

                const iconTextColor: string | undefined =
                  (kpiCard[
                    `cardIcon${colorType}Color` as keyof typeof kpiCard
                  ] as unknown as string | undefined) ||
                  (affiliate && defaultColorPair.iconColor) ||
                  undefined

                const borderColor =
                  (affiliate && kpiCard.cardBorderColor) || "#e5e7eb"
                const shadowColor =
                  (affiliate && kpiCard.cardShadowColor) || "rgba(0, 0, 0, 0.1)"
                const primaryTextColor =
                  (affiliate && kpiCard.cardPrimaryTextColor) || "inherit"
                const secondaryTextColor =
                  (affiliate && kpiCard.cardSecondaryTextColor) || "#6b7280"
                const popOverPrimaryTextColor =
                  (affiliate && kpiCard.kpiPopoverTextPrimaryColor) || "inherit"
                const popOverSecondaryTextColor =
                  (affiliate && kpiCard.kpiPopoverTextSecondaryColor) ||
                  "#6b7280"
                return (
                  <div
                    key={label}
                    className={cn(
                      "p-3 flex items-center gap-4 rounded-lg bg-white",
                      isPreview ? "text-sm" : "text-base",
                      affiliate && kpiCard.cardBorder && "border",
                      affiliate &&
                        kpiCard.cardShadow &&
                        `shadow-${(affiliate && kpiCard.cardShadowThickness) || "sm"}`
                    )}
                    style={{
                      borderColor:
                        affiliate && kpiCard.cardBorder
                          ? affiliate && borderColor
                          : undefined,
                      boxShadow:
                        affiliate && kpiCard.cardShadow
                          ? `${
                              affiliate && kpiCard.cardShadowThickness === "xl"
                                ? "0 10px 20px"
                                : affiliate &&
                                    kpiCard.cardShadowThickness === "lg"
                                  ? "0 6px 12px"
                                  : affiliate &&
                                      kpiCard.cardShadowThickness === "md"
                                    ? "0 4px 8px"
                                    : "0 2px 4px"
                            } ${affiliate && shadowColor}`
                          : undefined,
                      background:
                        (affiliate && kpiCard.cardBackgroundColor) || undefined,
                    }}
                  >
                    <div
                      className={cn(
                        "flex-shrink-0 rounded-xl flex items-center justify-center",
                        isPreview ? "w-8 h-8" : "p-3",
                        typeof iconBgColor === "string" &&
                          affiliate &&
                          iconBgColor.startsWith("bg-")
                          ? affiliate && iconBgColor
                          : ""
                      )}
                      style={{
                        backgroundColor:
                          typeof iconBgColor === "string" &&
                          affiliate &&
                          !iconBgColor.startsWith("bg-")
                            ? affiliate && iconBgColor
                            : undefined,
                      }}
                    >
                      <Icon
                        className={cn(
                          isPreview ? "w-4 h-4" : "w-8 h-8",
                          typeof iconTextColor === "string" &&
                            affiliate &&
                            iconTextColor.startsWith("text-")
                            ? affiliate && iconTextColor
                            : ""
                        )}
                        style={{
                          color:
                            typeof iconTextColor === "string" &&
                            affiliate &&
                            !iconTextColor.startsWith("text-")
                              ? affiliate && iconTextColor
                              : undefined,
                        }}
                      />
                    </div>

                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="space-y-1 overflow-hidden cursor-pointer">
                          <div
                            className="truncate font-medium"
                            style={{ color: affiliate && secondaryTextColor }}
                          >
                            {label}
                          </div>
                          <div
                            className="font-bold leading-tight truncate"
                            style={{ color: affiliate && primaryTextColor }}
                          >
                            {formatValue(
                              label,
                              value as number,
                              currentCurrency
                            )}
                          </div>
                        </div>
                      </PopoverTrigger>

                      <PopoverContent
                        affiliate={affiliate}
                        className="w-fit p-3 rounded-md shadow-lg border bg-white"
                      >
                        <div
                          className="text-sm font-semibold"
                          style={{
                            color: affiliate && popOverSecondaryTextColor,
                          }}
                        >
                          {label}
                        </div>
                        <div
                          className="text-base font-bold mt-1"
                          style={{
                            color: affiliate && popOverPrimaryTextColor,
                          }}
                        >
                          {formatValue(label, value as number, currentCurrency)}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Cards
