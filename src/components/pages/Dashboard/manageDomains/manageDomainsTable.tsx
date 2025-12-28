"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TableTop } from "@/components/ui-custom/TableTop"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { useAppQuery } from "@/hooks/useAppQuery"
import { TableView } from "@/components/ui-custom/TableView"
import { getDomains } from "@/app/(organization)/organization/[orgId]/dashboard/manageDomains/action"
import { manageDomainsColumns } from "@/components/pages/Dashboard/manageDomains/manageDomainsColumns"
import { useState } from "react"
import { useCachedValidation } from "@/hooks/useCachedValidation"

export function manageDomainsTable({ orgId }: { orgId: string }) {
  const [sorting] = useState<SortingState>([])
  const [columnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection] = useState({})

  const { filters, setFilters } = useQueryFilter({
    emailKey: "domain",
  })
  const { data, error, isPending } = useAppQuery(
    ["org-domains", orgId, filters.offset, filters.email],
    getDomains,
    [orgId, filters.offset, filters.email],
    { enabled: !!orgId }
  )

  const tableData = data?.rows ?? []
  const hasNext = data?.hasNext ?? false

  const table = useReactTable({
    data: tableData,
    columns: manageDomainsColumns({
      onToggle: () => {},
      onDelete: () => {},
    }),
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualFiltering: true,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domains</CardTitle>
      </CardHeader>
      <CardContent>
        <TableTop
          filters={{ email: filters.email }}
          onEmailChange={(value) =>
            setFilters({
              email: value ? value.replace(/^https?:\/\//, "") : undefined,
            })
          }
          affiliate={false}
          onOrderChange={() => {}}
          table={table}
          placeholder="Filter domains..."
        />
        <TableView
          isPending={isPending}
          error={error}
          table={table}
          columns={table.getAllColumns()}
          affiliate={false}
          tableEmptyText="No domains found."
        />

        <PaginationControls
          offset={filters.offset}
          tableDataLength={tableData.length}
          hasNext={hasNext}
          setFilters={setFilters}
        />
      </CardContent>
    </Card>
  )
}
