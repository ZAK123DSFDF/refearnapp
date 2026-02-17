"use client"

import React, { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import YearSelect from "@/components/ui-custom/YearSelect"
import { DashboardThemeCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardThemeCustomizationOptions"
import { DashboardCardCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/DashboardCardCustomizationOptions"
import { TableCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/TableCustomizationOptions"
import { YearSelectCustomizationOptions } from "@/components/ui-custom/Customization/DashboardCustomization/YearSelectCustomizationOptions"
import { paymentColumns } from "@/components/pages/AffiliateDashboard/Payment/PaymentColumns"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useDashboardCard } from "@/hooks/useDashboardCard"
import { dummyAffiliatePayments } from "@/lib/types/organization/previewData"
import { useAtomValue } from "jotai"
import { dashboardThemeCustomizationAtom } from "@/store/DashboardCustomizationAtom"
import { useAppQuery } from "@/hooks/useAppQuery"
import { TableView } from "@/components/ui-custom/TableView"
import { previewSimulationAtom } from "@/store/PreviewSimulationAtom"
import { api } from "@/lib/apiClient"
import { useAppTable } from "@/hooks/useAppTable"

interface AffiliateCommissionTableProps {
  orgId: string
  isPreview?: boolean
  affiliate: boolean
}

export default function AffiliateCommissionTable({
  orgId,
  isPreview,
  affiliate = false,
}: AffiliateCommissionTableProps) {
  const {
    dashboardHeaderDescColor,
    cardHeaderPrimaryTextColor,
    dashboardHeaderNameColor,
  } = useAtomValue(dashboardThemeCustomizationAtom)
  const previewSimulation = useAtomValue(previewSimulationAtom)
  const dashboardCardStyle = useDashboardCard(affiliate)
  const { filters, setFilters } = useQueryFilter()
  const [isFakeLoadingPreview, setIsFakeLoadingPreview] = useState(false)
  useEffect(() => {
    if (!isPreview) return

    setIsFakeLoadingPreview(true)

    const timer = setTimeout(() => {
      setIsFakeLoadingPreview(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [filters, isPreview])
  const {
    data: yearSelectedData,
    error: searchError,
    isPending,
  } = useAppQuery(
    ["affiliate-commissions", orgId, filters.year],
    (id, year) => api.affiliate.dashboard.payment([id, year]),
    [orgId, filters.year] as const,
    {
      enabled: !!(orgId && !isPreview),
    }
  )
  const filteredData = React.useMemo(() => {
    if (!isPreview) return yearSelectedData
    if (previewSimulation === "empty") return []
    if (!filters.year) return dummyAffiliatePayments

    return dummyAffiliatePayments.filter((row) => {
      const rowYear = new Date(row.month).getFullYear()
      return rowYear === filters.year
    })
  }, [filters.year, isPreview, previewSimulation])

  const columns = paymentColumns(affiliate)
  const { table } = useAppTable({
    data: isPreview ? (filteredData ?? []) : (yearSelectedData ?? []),
    columns,
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
              Affiliate Earnings
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
              Monthly breakdown of your affiliate commissions
            </p>
            {isPreview && (
              <DashboardThemeCustomizationOptions
                name="dashboardHeaderDescColor"
                buttonSize="w-4 h-4"
              />
            )}
          </div>
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
            <TableCustomizationOptions triggerSize="w-6 h-6" type="payment" />
          </div>
        )}
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle
            style={{
              color: (affiliate && cardHeaderPrimaryTextColor) || undefined,
            }}
          >
            <div className="flex flex-row gap-2 items-center">
              Monthly Commission Stats
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
            <YearSelect
              value={{ year: filters.year }}
              onChange={(year) => setFilters({ year })}
              affiliate={affiliate}
              allowAll={false}
            />
          </div>
        </CardHeader>
        <CardContent>
          <TableView
            isPending={
              !!(
                (isPending && !isPreview) ||
                (isPreview &&
                  (isFakeLoadingPreview || previewSimulation === "loading"))
              )
            }
            error={
              isPreview && previewSimulation === "error"
                ? "Simulated error fetching commission data."
                : searchError
            }
            table={table}
            columns={columns}
            affiliate={affiliate}
            isPreview={isPreview}
            tableEmptyText="No commission data available for the selected year."
          />
        </CardContent>
      </Card>
    </div>
  )
}
