// @/components/pages/AffiliateDashboard/AffiliateCoupon/affiliateCouponTable.tsx
"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableView } from "@/components/ui-custom/TableView"
import { TableTop } from "@/components/ui-custom/TableTop"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { affiliateCouponColumns } from "./affiliateCouponColumns"
import { AffiliateCouponDetails } from "@/components/ui-custom/AffiliateCouponDetails"
import { useAppTable } from "@/hooks/useAppTable"
import { useAppQuery } from "@/hooks/useAppQuery"
import { useQueryFilter } from "@/hooks/useQueryFilter"
import { api } from "@/lib/apiClient"
import PaginationControls from "@/components/ui-custom/PaginationControls"
import { AffiliateCouponData } from "@/lib/types/affiliate/affiliateCouponData"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { useAppMutation } from "@/hooks/useAppMutation"
import { markCouponAsSeenAction } from "@/app/affiliate/[orgId]/dashboard/coupons/action"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"

export default function AffiliateCouponsTable({ orgId }: { orgId: string }) {
  const [selectedCoupon, setSelectedCoupon] =
    useState<AffiliateCouponData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { showCustomToast } = useCustomToast()
  // 1. Manage Filters
  const { filters, setFilters } = useQueryFilter({ emailKey: "code" })
  const router = useRouter()
  const queryClient = useQueryClient()
  // 2. Fetch Live Data
  const { data, isPending, error } = useAppQuery(
    ["affiliate-coupons", orgId, filters.offset, filters.email],
    (id, query) => api.affiliate.dashboard.coupons([id, query]),
    [
      orgId,
      {
        offset: filters.offset,
        code: filters.email, // Search by code
      },
    ] as const,
    { enabled: !!orgId }
  )
  const { mutate: markAsSeen } = useAppMutation(
    ({ couponId }: { couponId: string }) =>
      markCouponAsSeenAction({ orgId, couponId }),
    {
      affiliate: true,
      disableSuccessToast: true, // We don't need a toast just for clicking "Details"
      onSuccess: (res) => {
        if (res.ok) {
          router.refresh()
          queryClient
            .invalidateQueries({
              queryKey: ["affiliate-coupons", orgId],
            })
            .then(() => console.log("invalidated"))
        }
      },
    }
  )
  const handleDetailsClick = (coupon: AffiliateCouponData) => {
    setSelectedCoupon(coupon)
    setIsDialogOpen(true)
    if (!coupon.isSeenByAffiliate) {
      markAsSeen({ couponId: coupon.id })
    }
  }

  const columns = affiliateCouponColumns(handleDetailsClick, showCustomToast)
  const rows = data?.rows ?? []
  const hasNext = data?.hasNext ?? false

  const { table } = useAppTable({
    data: rows,
    columns,
    manualPagination: true,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold">Promotion Codes</h1>
        <p className="text-muted-foreground">
          Share these exclusive discounts with your audience
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Coupons</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <TableTop
            filters={{ email: filters.email }}
            onEmailChange={(val) =>
              setFilters({ email: val || undefined, offset: 1 })
            }
            onOrderChange={() => {}} // No sorting needed for affiliates usually
            affiliate={true}
            table={table}
            hideOrder={true}
            placeholder="Search by code..."
          />

          <TableView
            isPending={isPending}
            error={error}
            table={table}
            columns={columns}
            affiliate={true}
            tableEmptyText="No coupons assigned to you yet."
          />

          <PaginationControls
            offset={filters.offset}
            tableDataLength={rows.length}
            hasNext={hasNext}
            setFilters={setFilters}
          />
        </CardContent>
      </Card>

      <AppDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        title="Coupon Details"
        description="Here is how this coupon works for you and your users."
        affiliate={true}
        showFooter={false}
      >
        {selectedCoupon && <AffiliateCouponDetails coupon={selectedCoupon} />}
      </AppDialog>
    </div>
  )
}
