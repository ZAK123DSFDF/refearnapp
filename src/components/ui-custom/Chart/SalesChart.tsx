"use client"

import React, { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  ResponsiveContainer,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import MonthSelect from "@/components/ui-custom/MonthSelect"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { Separator } from "@/components/ui/separator"
import { ChartCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/ChartCustomizationOptions"
import { getAffiliateKpiTimeSeries } from "@/app/affiliate/[orgId]/dashboard/action"
import { getOrganizationKpiTimeSeries } from "@/app/(organization)/organization/[orgId]/dashboard/action"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { dummyChartData } from "@/lib/types/dummyChartData"
import { useAtomValue } from "jotai"
import {
  chartCustomizationAtom,
  dashboardThemeCustomizationAtom,
} from "@/store/DashboardCustomizationAtom"
import { useAppQuery } from "@/hooks/useAppQuery"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { getTeamOrganizationKpiTimeSeries } from "@/app/(organization)/organization/[orgId]/teams/dashboard/action"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { cn } from "@/lib/utils"
import { getResponsiveCardHeight } from "@/util/GetResponsiveSelectWidth"
import { getOrganizationCurrency } from "@/lib/server/getOrganizationCurrency"
import { formatCurrency } from "@/util/Formatter"

interface ChartDailyMetricsProps {
  orgId: string
  affiliate: boolean
  isPreview?: boolean
  isTeam?: boolean
}

export function ChartDailyMetrics({
  orgId,
  affiliate = false,
  isPreview = false,
  isTeam = false,
}: ChartDailyMetricsProps) {
  const previewSimulation = useAtomValue(previewSimulationAtom)
  useVerifyTeamSession(orgId, isTeam)
  const { filters, setFilters } = useQueryFilter({
    yearKey: "chartYear",
    monthKey: "chartMonth",
  })
  const dashboardCardStyle = useDashboardCard(affiliate)
  const {
    data: affiliateSearchData,
    error: affiliateSearchError,
    isPending: affiliateSearchPending,
  } = useAppQuery(
    ["affiliate-kpi-time-series", orgId, filters.year, filters.month],
    getAffiliateKpiTimeSeries,
    [orgId, filters.year, filters.month],
    {
      enabled: !!(affiliate && orgId && !isPreview),
    }
  )
  const { data: currency = "USD" } = useAppQuery(
    ["org-currency", orgId],
    getOrganizationCurrency,
    [orgId],
    { enabled: !!orgId }
  )
  const fetchFn = isTeam
    ? getTeamOrganizationKpiTimeSeries
    : getOrganizationKpiTimeSeries
  const {
    data: organizationSearchData,
    error: organizationSearchError,
    isPending: organizationSearchPending,
  } = useAppQuery(
    ["organization-kpi-time-series", orgId, filters.year, filters.month],
    fetchFn,
    [orgId, filters.year, filters.month],
    {
      enabled: !!(!affiliate && orgId && !isPreview),
    }
  )
  const searchData = affiliate ? affiliateSearchData : organizationSearchData
  const searchError = affiliate ? affiliateSearchError : organizationSearchError
  const searchPending = affiliate
    ? affiliateSearchPending
    : organizationSearchPending
  const [previewLoading, setPreviewLoading] = useState(isPreview)

  useEffect(() => {
    if (isPreview) {
      const timer = setTimeout(() => setPreviewLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [isPreview])
  const data = React.useMemo(() => {
    if (previewSimulation === "empty") return []
    const source = isPreview ? dummyChartData : (searchData ?? [])
    return source.map((item) => ({
      ...item,
      date: item.createdAt,
      visits: item.visitors,
    }))
  }, [isPreview, searchData, previewSimulation])
  const {
    chartSecondaryColor,
    chartPrimaryColor,
    chartTertiaryColor,
    chartHorizontalLineColor,
    chartDateColor,
    chartLoadingColor,
    chartErrorColor,
  } = useAtomValue(chartCustomizationAtom)
  const {
    separatorColor,
    cardHeaderDescriptionTextColor,
    cardHeaderPrimaryTextColor,
  } = useAtomValue(dashboardThemeCustomizationAtom)
  const baseColors: any = {
    visits: (affiliate && chartPrimaryColor) || "#60A5FA",
    sales: (affiliate && chartSecondaryColor) || "#A78BFA",
    conversionRate: (affiliate && chartTertiaryColor) || "#5EEAD4",
    amount: "#F59E0B",
  }
  const symbol = formatCurrency(0, currency).replace(/[0.,\s]/g, "")
  const chartConfig: ChartConfig = {
    visits: { label: "Visits", color: "var(--chart-1)" },
    sales: { label: "Sales", color: "var(--chart-2)" },
    conversionRate: {
      label: "Conversion Rate (%)",
      color: "var(--chart-3)",
    },
    amount: {
      label: `${affiliate ? "Commission" : "Revenue"} (${symbol})`,
      color: "var(--chart-4)",
    },
  }

  const chartKeys = Object.keys(chartConfig)
  const isLoading =
    (isPreview && (previewLoading || previewSimulation === "loading")) ||
    (!isPreview && searchPending)
  const isError = (isPreview && previewSimulation === "error") || searchError
  return (
    <Card
      className={cn(
        getResponsiveCardHeight(isPreview),
        "flex flex-col relative"
      )}
      style={dashboardCardStyle}
    >
      <CardHeader
        className={cn(
          "flex flex-col items-start gap-2 space-y-0",
          isPreview ? "py-2" : "py-5",
          "sm:flex-row sm:items-center sm:justify-between"
        )}
      >
        <div className="grid flex-1 gap-1">
          <div className="flex flex-row gap-1 items-center">
            <CardTitle
              className={cn(isPreview ? "text-sm" : "text-lg")}
              style={{
                color: (affiliate && cardHeaderPrimaryTextColor) || undefined,
              }}
            >
              Daily Metrics
            </CardTitle>
          </div>
          <div className="flex flex-row items-center">
            <CardDescription
              className={isPreview ? "text-xs" : "text-sm"}
              style={{
                color:
                  (affiliate && cardHeaderDescriptionTextColor) || undefined,
              }}
            >
              Visits, Sales, Conversion Rate and commission over time
              {affiliate ? "Commission" : "Revenue"}
            </CardDescription>
          </div>
        </div>
        <MonthSelect
          isPreview={isPreview}
          value={{ year: filters.year, month: filters.month }}
          onChange={(year, month) => setFilters({ year, month })}
          affiliate={affiliate}
        />
      </CardHeader>

      <Separator
        style={{
          backgroundColor: (affiliate && separatorColor) || undefined,
        }}
      />
      {isPreview && (
        <div className="flex justify-end px-4 pt-2">
          <DashboardThemeCustomizationOptions
            name="separatorColor"
            buttonSize="w-4 h-4"
          />
        </div>
      )}
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {isLoading ? (
          <div
            className={`flex flex-col items-center justify-center ${
              isPreview ? "h-[140px]" : "h-[300px]"
            } gap-2`}
          >
            <svg
              className="animate-spin h-6 w-6"
              viewBox="0 0 24 24"
              style={{
                color: (affiliate && chartLoadingColor) || "#6B7280",
              }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span
              className="text-sm"
              style={{
                color: (affiliate && chartLoadingColor) || "#6B7280",
              }}
            >
              Loading...
            </span>
          </div>
        ) : isError ? (
          <div
            className={`flex flex-col items-center justify-center ${
              isPreview ? "h-[140px]" : "h-[300px]"
            } gap-2`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-red-500"
              fill="none"
              stroke="currentColor"
              style={{
                color: (affiliate && chartErrorColor) || undefined,
              }}
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M12 2a10 10 0 110 20 10 10 0 010-20z"
              />
            </svg>
            <span
              className="text-sm text-red-500"
              style={{
                color: (affiliate && chartErrorColor) || undefined,
              }}
            >
              Failed to load chart data
            </span>
            <span
              className="text-red-500 text-sm text-center px-6"
              style={{
                color: (affiliate && chartErrorColor) || undefined,
              }}
            >
              {searchError || "An unexpected error occurred."}
            </span>
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className={`${
              isPreview ? "h-[180px] max-w-[260px] mx-auto" : "h-[300px] w-full"
            }`}
          >
            <div className={isPreview ? "h-[200px]" : "h-[320px] w-full"}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    {chartKeys.map((key) => (
                      <linearGradient
                        id={`fill-${key}`}
                        key={key}
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={baseColors[key]}
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="100%"
                          stopColor={baseColors[key]}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    stroke={
                      (affiliate && chartHorizontalLineColor) || "#E5E7EB"
                    }
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    minTickGap={32}
                    tick={{
                      style: {
                        fill: (affiliate && chartDateColor) || "#6B7280",
                      },
                    }}
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        affiliate={affiliate}
                        labelFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        }
                        indicator="dot"
                      />
                    }
                  />
                  {chartKeys.map((key) => (
                    <Area
                      key={key}
                      dataKey={key}
                      type="monotone"
                      fill={`url(#fill-${key})`}
                      stroke={baseColors[key]}
                      strokeWidth={2}
                    />
                  ))}
                  <ChartLegend
                    content={
                      <ChartLegendContent
                        affiliate={affiliate}
                        isPreview={isPreview}
                      />
                    }
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        )}
      </CardContent>
      {isPreview && (
        <div className="absolute bottom-1 left-1 pt-2">
          <ChartCustomizationOptions triggerSize="w-5 h-5" dropdownSize="sm" />
        </div>
      )}
    </Card>
  )
}
