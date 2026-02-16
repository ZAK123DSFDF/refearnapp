"use client"

import React, { useEffect, useState } from "react"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createAffiliateLink } from "@/app/affiliate/[orgId]/dashboard/links/action"
import { AffiliateLinkWithStats } from "@/lib/types/affiliate/affiliateLinkWithStats"
import MonthSelect from "@/components/ui-custom/MonthSelect"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { DashboardButtonCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardButtonCustomizationOptions"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import { TableCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/TableCustomizationOptions"
import { YearSelectCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/YearSelectCustomizationOptions"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { useAppQuery } from "@/hooks/useAppQuery"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useLinksColumns } from "@/components/pages/AffiliateDashboard/Links/LinksColumns"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { dummyAffiliateLinksRaw } from "@/lib/types/organization/previewData"
import { useAtomValue } from "jotai"
import {
  dashboardButtonCustomizationAtom,
  dashboardThemeCustomizationAtom,
} from "@/store/DashboardCustomizationAtom"
import { useAppMutation } from "@/hooks/useAppMutation"
import { TableView } from "@/components/ui-custom/TableView"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/apiClient"

interface AffiliateLinkProps {
  orgId: string
  isPreview?: boolean
  affiliate: boolean
}
export default function Links({
  orgId,
  isPreview,
  affiliate,
}: AffiliateLinkProps) {
  const {
    dashboardHeaderDescColor,
    dashboardHeaderNameColor,
    cardHeaderPrimaryTextColor,
  } = useAtomValue(dashboardThemeCustomizationAtom)
  const previewSimulation = useAtomValue(previewSimulationAtom)
  const {
    dashboardButtonDisabledTextColor,
    dashboardButtonTextColor,
    dashboardButtonDisabledBackgroundColor,
    dashboardButtonBackgroundColor,
  } = useAtomValue(dashboardButtonCustomizationAtom)
  const dashboardCardStyle = useDashboardCard(affiliate)
  const { showCustomToast } = useCustomToast()
  const [isFakeLoading, setIsFakeLoading] = useState(false)
  const [isFakeLoadingPreview, setIsFakeLoadingPreview] = useState(false)
  const { filters, setFilters } = useQueryFilter()
  const queryClient = useQueryClient()
  useEffect(() => {
    if (!isPreview) return

    setIsFakeLoadingPreview(true)

    const timer = setTimeout(() => {
      setIsFakeLoadingPreview(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [filters, isPreview])
  const { data: orgData } = useAppQuery(
    ["organization-settings", orgId],
    (id) => api.organization.org([id]),
    [orgId] as const,
    { enabled: !!orgId }
  )
  const displayCurrency = orgData?.currency || "USD"
  const {
    data: searchData,
    error: searchError,
    isPending: searchPending,
  } = useAppQuery(
    ["affiliate-links", orgId, filters.year, filters.month],
    (id, year, month) => api.affiliate.dashboard.links([id, year, month]),
    [orgId, filters.year, filters.month] as const,
    {
      enabled: !!(orgId && !isPreview),
    }
  )
  const filteredPreviewData = React.useMemo(() => {
    if (!isPreview) return searchData as AffiliateLinkWithStats[]
    if (previewSimulation === "empty") return []
    if (!dummyAffiliateLinksRaw) return []

    return dummyAffiliateLinksRaw.map((link) => {
      // Helper function to check date matches
      const dateMatches = (dateStr: Date) => {
        const d = new Date(dateStr)
        const matchesYear = filters.year
          ? d.getFullYear() === filters.year
          : true
        const matchesMonth = filters.month
          ? d.getMonth() + 1 === filters.month
          : true
        return matchesYear && matchesMonth
      }

      const filteredClicks = link.clicks.filter((c) => dateMatches(c.createdAt))
      const filteredSales = link.sales.filter((s) => dateMatches(s.createdAt))

      // NEW: filter commissions by year/month
      const filteredCommissions = link.commissions.filter((com) =>
        dateMatches(com.createdAt)
      )

      // aggregate totals
      const totalClicks = filteredClicks.reduce((sum, c) => sum + c.count, 0)
      const totalSales = filteredSales.reduce((sum, s) => sum + s.count, 0)

      // NEW: aggregate total commission
      const totalCommission = filteredCommissions.reduce(
        (sum, com) => sum + com.amount,
        0
      )

      const conversionRate =
        totalClicks > 0
          ? parseFloat(((totalSales / totalClicks) * 100).toFixed(2))
          : 0

      return {
        id: link.id,
        fullUrl: link.fullUrl,
        createdAt: link.createdAt,
        clicks: totalClicks,
        sales: totalSales,
        conversionRate,
        commission: totalCommission,
      } satisfies AffiliateLinkWithStats
    })
  }, [isPreview, filters, previewSimulation, searchData])

  const mutation = useAppMutation(createAffiliateLink, {
    affiliate,
    onSuccess: () => {
      queryClient
        .invalidateQueries({
          queryKey: ["affiliate-links", orgId, filters.year, filters.month],
        })
        .then(() => console.log("invalidated"))
    },
  })

  const handleCreate = () => {
    if (isPreview) {
      setIsFakeLoading(true)
      setTimeout(() => {
        setIsFakeLoading(false)
        showCustomToast({
          type: "success",
          title: "Preview Mode",
          description: "Simulated link creation.",
          affiliate,
        })
      }, 1500)
    } else {
      mutation.mutate(orgId)
    }
  }
  const columns = useLinksColumns(affiliate, displayCurrency)
  const table = useReactTable({
    data: isPreview ? (filteredPreviewData ?? []) : (searchData ?? []),
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex flex-row gap-2 items-center">
            <h1
              className="text-3xl font-bold"
              style={{
                color: (affiliate && dashboardHeaderNameColor) || undefined,
              }}
            >
              Affiliate Links
            </h1>
            {isPreview && (
              <DashboardThemeCustomizationOptions
                name="dashboardHeaderNameColor"
                buttonSize="w-4 h-4"
              />
            )}
          </div>
          <div className="flex flex-row gap-2 items-center">
            <p
              className="text-muted-foreground"
              style={{
                color: (affiliate && dashboardHeaderDescColor) || undefined,
              }}
            >
              {orgData ? (
                <>
                  Share your links and earn{" "}
                  <strong>
                    {orgData.commissionType === "PERCENTAGE"
                      ? `${orgData.commissionValue}%`
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: displayCurrency,
                        }).format(Number(orgData.commissionValue))}
                  </strong>{" "}
                  commission on every sale!
                </>
              ) : (
                "Track your referral links and their performance"
              )}
            </p>
            {isPreview && (
              <DashboardThemeCustomizationOptions
                name="dashboardHeaderDescColor"
                buttonSize="w-4 h-4"
              />
            )}
          </div>
        </div>
        <div className="flex flex-row gap-2 items-center">
          {isPreview && (
            <DashboardButtonCustomizationOptions triggerSize="w-6 h-6" />
          )}
          <Button
            onClick={handleCreate}
            disabled={mutation.isPending || isFakeLoading}
            style={{
              backgroundColor:
                mutation.isPending || isFakeLoading
                  ? (affiliate && dashboardButtonDisabledBackgroundColor) ||
                    undefined
                  : (affiliate && dashboardButtonBackgroundColor) || undefined,
              color:
                mutation.isPending || isFakeLoading
                  ? (affiliate && dashboardButtonDisabledTextColor) || undefined
                  : (affiliate && dashboardButtonTextColor) || undefined,
            }}
          >
            {mutation.isPending || isFakeLoading
              ? "Creating..."
              : "Create New Link"}
          </Button>
        </div>
      </div>

      <Card className="relative" style={dashboardCardStyle}>
        {isPreview && (
          <div className="absolute bottom-0 left-0 p-2">
            <DashboardCardCustomizationOptions
              triggerSize="w-6 h-6"
              dropdownSize="w-[150px]"
            />
          </div>
        )}{" "}
        {isPreview && (
          <div className="absolute bottom-0 right-0 p-2">
            <TableCustomizationOptions triggerSize="w-6 h-6" type="link" />
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle
            style={{
              color: (affiliate && cardHeaderPrimaryTextColor) || undefined,
            }}
            className="text-lg"
          >
            <div className="flex flex-row items-center gap-2">
              Link Stats
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
        </CardHeader>
        <CardContent>
          <TableView
            isPending={
              !!(
                (searchPending && !isPreview) ||
                (isPreview &&
                  (isFakeLoadingPreview || previewSimulation === "loading"))
              )
            }
            error={
              isPreview && previewSimulation === "error"
                ? "Simulated error fetching affiliate links."
                : searchError
            }
            table={table}
            columns={columns}
            affiliate={affiliate}
            isPreview={isPreview}
            tableEmptyText="No affiliate links found."
          />
        </CardContent>
      </Card>
    </div>
  )
}
