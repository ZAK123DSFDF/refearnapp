"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import MonthSelect from "@/components/ui-custom/MonthSelect"
import { TableTop } from "@/components/ui-custom/TableTop"
import { AffiliatesColumns } from "@/components/pages/Dashboard/Affiliates/AffiliatesColumns"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { useAppQuery } from "@/hooks/useAppQuery"
import { TableView } from "@/components/ui-custom/TableView"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { api } from "@/lib/apiClient"
import { useAppTable } from "@/hooks/useAppTable"

interface AffiliatesTableProps {
  orgId: string
  cardTitle?: string
  showHeader?: boolean
  affiliate: boolean
  mode?: "default" | "top"
  isTeam?: boolean
}
export default function AffiliatesTable({
  orgId,
  cardTitle = "Overview of all affiliate activities",
  showHeader = false,
  affiliate = false,
  mode = "default",
  isTeam = false,
}: AffiliatesTableProps) {
  useVerifyTeamSession(orgId, isTeam)
  const columns = AffiliatesColumns()
  const { filters, setFilters } = useQueryFilter()
  const {
    data: searchData,
    error: searchError,
    isPending: searchPending,
  } = useAppQuery(
    [
      isTeam ? "team-affiliates" : "org-affiliates",
      orgId,
      filters.year,
      filters.month,
      filters.orderBy,
      filters.orderDir,
      filters.offset,
      filters.email,
    ],
    // The fetch function logic switches based on isTeam
    (id, query) =>
      isTeam
        ? api.organization.teams.dashboard.affiliates([id, query])
        : api.organization.dashboard.affiliates([id, query]),
    [
      orgId,
      {
        year: filters.year,
        month: filters.month,
        orderBy: filters.orderBy === "none" ? undefined : filters.orderBy,
        orderDir: filters.orderDir,
        offset: filters.offset,
        email: filters.email,
      },
    ] as const,
    {
      enabled: !!(!affiliate && orgId),
    }
  )
  const tableData = searchData?.rows ?? []
  const hasNext = searchData?.hasNext ?? false
  const { table } = useAppTable({
    data: tableData,
    columns,
    manualSorting: true,
    manualFiltering: true,
    manualPagination: true,
  })

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      {showHeader && (
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div>
              <h1 className="text-3xl font-bold">Affiliates</h1>
              <p className="text-muted-foreground">
                Track and manage your affiliate performance metrics
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Table Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 md:justify-between">
          <CardTitle className="min-[320px]:text-lg">{cardTitle}</CardTitle>
          <MonthSelect
            value={{ year: filters.year, month: filters.month }}
            onChange={(year, month) => setFilters({ year, month })}
            affiliate={false}
          />
        </CardHeader>
        <CardContent>
          <TableTop
            filters={{
              orderBy: filters.orderBy,
              orderDir: filters.orderDir,
              email: filters.email,
            }}
            onOrderChange={(orderBy, orderDir) =>
              setFilters({ orderBy, orderDir })
            }
            onEmailChange={(email) => setFilters({ email: email || undefined })}
            affiliate={false}
            table={table}
            mode={mode}
          />

          <TableView
            isPending={searchPending}
            error={searchError}
            table={table}
            affiliate={false}
            columns={columns}
            tableEmptyText="No Affiliates found."
          />

          {mode === "default" && (
            <PaginationControls
              offset={filters.offset}
              tableDataLength={tableData.length}
              hasNext={hasNext}
              setFilters={setFilters}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
