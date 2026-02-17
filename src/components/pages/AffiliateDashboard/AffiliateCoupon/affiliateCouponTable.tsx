"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TableView } from "@/components/ui-custom/TableView"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import {
  affiliateCouponColumns,
  AffiliateCouponData,
} from "@/components/pages/AffiliateDashboard/AffiliateCoupon/affiliateCouponColumns"
import { AffiliateCouponDetails } from "@/components/ui-custom/AffiliateCouponDetails"
import { useAppTable } from "@/hooks/useAppTable"

const DUMMY_DATA: AffiliateCouponData[] = [
  {
    id: "1",
    code: "GARY20",
    discountValue: "20",
    discountType: "PERCENTAGE",
    commissionValue: "30",
    commissionType: "FLAT_FEE",
    durationValue: "12",
    durationUnit: "month",
    isNew: false,
  },
]

export default function AffiliateCouponsTable({ orgId }: { orgId: string }) {
  const [selectedCoupon, setSelectedCoupon] =
    useState<AffiliateCouponData | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleDetailsClick = (coupon: AffiliateCouponData) => {
    setSelectedCoupon(coupon)
    setIsDialogOpen(true)
  }

  const columns = affiliateCouponColumns(handleDetailsClick)

  const { table } = useAppTable({
    data: DUMMY_DATA,
    columns,
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
        <CardContent>
          <TableView
            isPending={false}
            table={table}
            columns={columns}
            affiliate={true}
            tableEmptyText="No coupons assigned to you yet."
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
