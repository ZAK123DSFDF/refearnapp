"use client"

import * as React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TableTop } from "@/components/ui-custom/TableTop"
import { TableView } from "@/components/ui-custom/TableView"
import { PromotionCodesColumns } from "./PromotionCodesColumns"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { AssignAffiliateForm } from "@/components/ui-custom/AssignAffiliateForm"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { useAppQuery } from "@/hooks/useAppQuery"
import { api } from "@/lib/apiClient"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { useVerifyTeamSession } from "@/hooks/useVerifyTeamSession"
import { useAppTable } from "@/hooks/useAppTable"
import { useEffect } from "react"
import {
  COUPON_SORT_OPTIONS,
  CouponSortKeys,
} from "@/lib/types/organization/couponSortKeys"

export default function PromotionCodesTable({
  orgId,
  isTeam = false,
}: {
  orgId: string
  isTeam?: boolean
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedCodeId, setSelectedCodeId] = React.useState<string | null>(
    null
  )
  const [selectedCodeRow, setSelectedCodeRow] = React.useState<any | null>(null)
  // Verify Session
  useVerifyTeamSession(orgId, isTeam)

  // Manage Filters (Pagination/Search)
  const { filters, setFilters } = useQueryFilter<CouponSortKeys>({
    emailKey: "code",
  })

  // 1. Fetch Live Data using your SDK
  const {
    data: searchData,
    error: searchError,
    isPending: searchPending,
  } = useAppQuery(
    [
      isTeam ? "team-coupons" : "org-coupons",
      orgId,
      filters.offset,
      filters.email,
      filters.orderBy,
      filters.orderDir,
    ],
    (id, query) =>
      isTeam
        ? api.organization.teams.dashboard.coupons([id, query])
        : api.organization.dashboard.coupons([id, query]),
    [
      orgId,
      {
        offset: filters.offset,
        code: filters.email,
        orderBy: filters.orderBy === "none" ? undefined : filters.orderBy,
        orderDir: filters.orderDir,
      },
    ] as const,
    { enabled: !!orgId }
  )
  const { data: settings, isPending: isFetchingSettings } = useAppQuery(
    ["promo-settings", orgId, selectedCodeId],
    (orgId, codeId) =>
      api.organization.promotionCodes.settings([
        orgId,
        codeId,
        isTeam ? "team" : "admin",
      ]),
    [orgId, selectedCodeId!] as const, // The ! tells TS we handle the null via 'enabled'
    { enabled: !!selectedCodeId }
  )
  useEffect(() => {
    if (settings && selectedCodeId) {
      setIsModalOpen(true)
    }
  }, [settings, selectedCodeId])

  const handleAssignClick = (code: any) => {
    setSelectedCodeId(code.id)
    setSelectedCodeRow(code)
  }
  const handleClose = () => {
    setIsModalOpen(false)
    setSelectedCodeId(null)
  }
  const columns = PromotionCodesColumns(handleAssignClick)
  const tableData = searchData?.rows ?? []
  const hasNext = searchData?.hasNext ?? false

  const { table } = useAppTable({
    data: tableData,
    columns,
    manualPagination: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Promotion Codes</h1>
          <p className="text-muted-foreground">
            Manage and assign synced coupons to your affiliates
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Synced Coupons</CardTitle>
        </CardHeader>
        <CardContent>
          <TableTop<any, CouponSortKeys>
            filters={{
              email: filters.email,
              orderBy: filters.orderBy,
              orderDir: filters.orderDir,
            }}
            onOrderChange={(orderBy, orderDir) =>
              setFilters({ orderBy, orderDir })
            }
            onEmailChange={(val) =>
              setFilters({ email: val || undefined, offset: 1 })
            }
            affiliate={false}
            table={table}
            orderOptions={COUPON_SORT_OPTIONS}
            placeholder="Search coupon codes..."
          />

          <TableView
            isPending={searchPending}
            error={searchError}
            table={table}
            affiliate={false}
            columns={columns}
            tableEmptyText="No coupons found in your account."
          />

          <PaginationControls
            offset={filters.offset}
            tableDataLength={tableData.length}
            hasNext={hasNext}
            setFilters={setFilters}
          />
        </CardContent>
      </Card>

      <AppDialog
        open={isModalOpen}
        onOpenChange={handleClose}
        title={`Assign Coupon: ${selectedCodeRow?.code}`}
        description="Connect this synced coupon to an affiliate and define the commission rules."
        confirmText="Save Assignment"
        onConfirm={() => setIsModalOpen(false)}
        affiliate={false}
        showFooter={false}
      >
        <AssignAffiliateForm
          orgId={orgId}
          isTeam={isTeam}
          codeId={selectedCodeId!}
          settings={settings}
          initialAffiliate={{
            name: selectedCodeRow?.affiliateName,
            email: selectedCodeRow?.affiliateEmail,
          }}
          settingsLoading={isFetchingSettings}
          onClose={handleClose}
        />
      </AppDialog>
    </div>
  )
}
