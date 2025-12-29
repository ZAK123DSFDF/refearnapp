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
import { useRef, useState } from "react"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { getTeamDomains } from "@/app/(organization)/organization/[orgId]/teams/dashboard/manageDomains/action"
import { Button } from "@/components/ui/button"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { DomainInputField } from "@/components/ui-custom/DomainInputField"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { DomainCreateForm, domainCreateSchema } from "@/lib/schema/domainSchema"
import { useForm } from "react-hook-form"
interface AffiliatesTableManageDomainsProps {
  orgId: string
  affiliate: boolean
  isTeam?: boolean
}
export function ManageDomainsTable({
  orgId,
  affiliate = false,
  isTeam = false,
}: AffiliatesTableManageDomainsProps) {
  useVerifyTeamSession(orgId, isTeam)
  const [sorting] = useState<SortingState>([])
  const [columnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection] = useState({})
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const domainForm = useForm<DomainCreateForm>({
    resolver: zodResolver(domainCreateSchema),
    defaultValues: {
      defaultDomain: "",
    },
  })
  const { filters, setFilters } = useQueryFilter({
    emailKey: "domain",
  })
  const getManageDomains = isTeam ? getTeamDomains : getDomains
  const { data, error, isPending } = useAppQuery(
    ["org-domains", orgId, filters.offset, filters.email],
    getManageDomains,
    [orgId, filters.offset, filters.email],
    { enabled: !!orgId }
  )

  const tableData = data?.rows ?? []
  const hasNext = data?.hasNext ?? false

  const table = useReactTable({
    data: tableData,
    columns: manageDomainsColumns({
      onToggleActive: (id, isActive) => {
        console.log("Toggle active:", id, !isActive)
      },
      onMakePrimary: (id) => {
        console.log("Make primary:", id)
      },
      onToggleRedirect: (id, isRedirect) => {
        console.log("Toggle redirect:", id, !isRedirect)
      },
      onDelete: (id) => {
        console.log("Delete domain:", id)
      },
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
          hideOrder
          rightActions={
            <>
              <Button onClick={() => setOpen(true)}>Add Domain</Button>
              <AppDialog
                open={open}
                onOpenChange={setOpen}
                title="Add Domain"
                description="Add a new domain to your organization"
                confirmText="Add Domain"
                onConfirm={() => formRef.current?.requestSubmit()}
                affiliate={affiliate}
              >
                {/* 👇 reuse your existing component */}
                <Form {...domainForm}>
                  <form
                    ref={formRef}
                    onSubmit={domainForm.handleSubmit((data) => {
                      console.log(data.defaultDomain)
                      domainForm.reset()
                      setOpen(false)
                    })}
                    className="space-y-4"
                  >
                    <DomainInputField
                      control={domainForm.control}
                      form={domainForm}
                      createMode
                    />
                  </form>
                </Form>
              </AppDialog>
            </>
          }
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
