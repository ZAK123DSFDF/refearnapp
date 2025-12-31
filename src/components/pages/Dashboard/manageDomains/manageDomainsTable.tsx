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
import {
  createDomains,
  deleteDomain,
  getDomains,
  makeDomainPrimary,
  toggleDomainActive,
  toggleDomainRedirect,
  verifyDomain,
} from "@/app/(organization)/organization/[orgId]/dashboard/manageDomains/action"
import { manageDomainsColumns } from "@/components/pages/Dashboard/manageDomains/manageDomainsColumns"
import { useRef, useState } from "react"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import {
  createTeamDomains,
  deleteTeamDomain,
  getTeamDomains,
  makeTeamDomainPrimary,
  toggleTeamDomainActive,
  toggleTeamDomainRedirect,
  verifyTeamDomain,
} from "@/app/(organization)/organization/[orgId]/teams/dashboard/manageDomains/action"
import { Button } from "@/components/ui/button"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { DomainInputField } from "@/components/ui-custom/DomainInputField"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form } from "@/components/ui/form"
import { DomainCreateForm, domainCreateSchema } from "@/lib/schema/domainSchema"
import { useForm } from "react-hook-form"
import { DomainInputType } from "@/lib/types/createDomainType"
import { useQueryClient } from "@tanstack/react-query"
import { useAppMutation } from "@/hooks/useAppMutation"
import {
  DomainActionState,
  useDomainActionMeta,
} from "@/hooks/useDomainActionDialog"
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
  const [domainType, setDomainType] = useState<DomainInputType | null>(null)
  const [open, setOpen] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const [actionDialog, setActionDialog] = useState<DomainActionState | null>(
    null
  )

  const actionMeta = useDomainActionMeta(actionDialog)
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
  const createManageDomains = isTeam ? createTeamDomains : createDomains
  const toggleManageDomainActive = isTeam
    ? toggleTeamDomainActive
    : toggleDomainActive
  const makeManageDomainPrimary = isTeam
    ? makeTeamDomainPrimary
    : makeDomainPrimary
  const toggleManageDomainRedirect = isTeam
    ? toggleTeamDomainRedirect
    : toggleDomainRedirect
  const deleteManageDomain = isTeam ? deleteTeamDomain : deleteDomain
  const verifyManageDomain = isTeam ? verifyTeamDomain : verifyDomain
  const queryClient = useQueryClient()
  const { data, error, isPending } = useAppQuery(
    ["org-domains", orgId, filters.offset, filters.email],
    getManageDomains,
    [orgId, filters.offset, filters.email],
    { enabled: !!orgId }
  )
  const toggleActiveMutation = useAppMutation(toggleManageDomainActive, {
    affiliate,
  })
  const makePrimaryMutation = useAppMutation(makeManageDomainPrimary, {
    affiliate,
  })
  const toggleRedirectMutation = useAppMutation(toggleManageDomainRedirect, {
    affiliate,
  })
  const deleteDomainMutation = useAppMutation(deleteManageDomain, { affiliate })
  const verifyDnsMutation = useAppMutation(verifyManageDomain, {
    affiliate,
  })
  const handleConfirmAction = () => {
    if (!actionDialog) return

    const { domainId, type } = actionDialog

    const onSuccess = () => {
      queryClient
        .invalidateQueries({
          queryKey: ["org-domains", orgId],
        })
        .then(() => console.log("Invalidated domains query"))
      setActionDialog(null)
    }

    switch (type) {
      case "activate":
        toggleActiveMutation.mutate(
          { orgId, domainId, nextActive: true },
          { onSuccess }
        )
        break

      case "deactivate":
        toggleActiveMutation.mutate(
          { orgId, domainId, nextActive: false },
          { onSuccess }
        )
        break

      case "make-primary":
        makePrimaryMutation.mutate({ orgId, domainId }, { onSuccess })
        break

      case "enable-redirect":
        toggleRedirectMutation.mutate(
          { orgId, domainId, nextRedirect: true },
          { onSuccess }
        )
        break

      case "disable-redirect":
        toggleRedirectMutation.mutate(
          { orgId, domainId, nextRedirect: false },
          { onSuccess }
        )
        break
      case "verify-dns":
        verifyDnsMutation.mutate({ orgId, domainId }, { onSuccess })
        break

      case "delete":
        deleteDomainMutation.mutate({ orgId, domainId }, { onSuccess })
        break
    }
  }
  const createDomainMutation = useAppMutation(createManageDomains, {
    affiliate,
  })
  const tableData = data?.rows ?? []
  const hasNext = data?.hasNext ?? false

  const table = useReactTable({
    data: tableData,
    columns: manageDomainsColumns({
      onToggleActive: (id, isActive, domainName) =>
        setActionDialog({
          domainId: id,
          domainName,
          type: isActive ? "deactivate" : "activate",
        }),

      onMakePrimary: (id, domainName) =>
        setActionDialog({
          domainId: id,
          domainName,
          type: "make-primary",
        }),

      onToggleRedirect: (id, isRedirect, domainName) =>
        setActionDialog({
          domainId: id,
          domainName,
          type: isRedirect ? "disable-redirect" : "enable-redirect",
        }),

      onDelete: (id, domainName) =>
        setActionDialog({
          domainId: id,
          domainName,
          type: "delete",
        }),

      onVerifyDns: (id) => {
        const row = tableData.find((d) => d.id === id)
        if (!row) return

        setActionDialog({
          type: "verify-dns",
          domainId: id,
          domainName: row.domainName,
          domainType: row.type,
        })
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
                confirmLoading={createDomainMutation.isPending}
              >
                {/* 👇 reuse your existing component */}
                <Form {...domainForm}>
                  <form
                    ref={formRef}
                    onSubmit={domainForm.handleSubmit((data) => {
                      if (!domainType) return

                      createDomainMutation.mutate(
                        {
                          orgId,
                          domain: data.defaultDomain,
                          domainType,
                        },
                        {
                          onSuccess: () => {
                            queryClient
                              .invalidateQueries({
                                queryKey: ["org-domains", orgId],
                              })
                              .then(() =>
                                console.log("Invalidated domains query")
                              )
                            domainForm.reset()
                            setOpen(false)
                          },
                        }
                      )
                    })}
                    className="space-y-4"
                  >
                    <DomainInputField
                      control={domainForm.control}
                      form={domainForm}
                      onDomainTypeChange={setDomainType}
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
      <AppDialog
        open={!!actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
        title={
          actionDialog?.type === "verify-dns"
            ? "Verify Domain DNS"
            : actionMeta?.title
        }
        description={
          actionDialog?.type === "verify-dns"
            ? "Add the following DNS record to your domain provider, then click Verify."
            : actionMeta?.description
        }
        confirmText={
          actionDialog?.type === "verify-dns"
            ? "Verify Domain"
            : actionMeta?.confirmText
        }
        confirmColor={actionMeta?.color}
        onConfirm={handleConfirmAction}
        affiliate={affiliate}
        confirmLoading={
          verifyDnsMutation.isPending ||
          toggleActiveMutation.isPending ||
          makePrimaryMutation.isPending ||
          toggleRedirectMutation.isPending ||
          deleteDomainMutation.isPending
        }
      >
        {actionDialog?.type === "verify-dns" && (
          <div className="space-y-3 text-sm">
            {actionDialog.domainType === "CUSTOM_DOMAIN" ? (
              <div className="rounded-md border p-3 bg-gray-50 font-mono">
                <div>
                  <b>Type:</b> A
                </div>
                <div>
                  <b>Name:</b> @
                </div>
                <div>
                  <b>Value:</b> 76.76.21.21
                </div>
              </div>
            ) : (
              <div className="rounded-md border p-3 bg-gray-50 font-mono">
                <div>
                  <b>Type:</b> CNAME
                </div>
                <div>
                  <b>Name:</b> {actionDialog.domainName?.split(".")[0]}
                </div>
                <div>
                  <b>Value:</b> cname.vercel-dns.com
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500">
              DNS changes may take a few minutes to propagate.
            </p>
          </div>
        )}
      </AppDialog>
    </Card>
  )
}
