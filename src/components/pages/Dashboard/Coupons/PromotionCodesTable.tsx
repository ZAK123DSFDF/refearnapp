"use client"

import * as React from "react"
import { getCoreRowModel, useReactTable } from "@tanstack/react-table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { TableTop } from "@/components/ui-custom/TableTop"
import { TableView } from "@/components/ui-custom/TableView"
import {
  PromotionCodesColumns,
  PromotionCodeDummy,
} from "./PromotionCodesColumns"
import { AppDialog } from "@/components/ui-custom/AppDialog"
import { AssignAffiliateForm } from "@/components/ui-custom/AssignAffiliateForm"

const DUMMY_DATA: PromotionCodeDummy[] = [
  {
    id: "1",
    code: "SAVE20",
    status: "active",
    affiliateName: null,
    discountValue: "20",
    discountType: "PERCENTAGE",
  },
  {
    id: "2",
    code: "WELCOME5",
    status: "active",
    affiliateName: "John Doe",
    discountValue: "5",
    discountType: "FLAT_FEE",
    commissionValue: "30",
    commissionType: "PERCENTAGE", // 👈 Added this to fix the "-"
    durationValue: "12", // 👈 Added duration
    durationUnit: "month",
  },
  {
    id: "3",
    code: "EXPIRED10",
    status: "inactive",
    affiliateName: null,
    discountValue: "10",
    discountType: "PERCENTAGE",
  },
]

export default function PromotionCodesTable({ orgId }: { orgId: string }) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedCode, setSelectedCode] =
    React.useState<PromotionCodeDummy | null>(null)

  const handleAssignClick = (code: PromotionCodeDummy) => {
    setSelectedCode(code)
    setIsModalOpen(true)
  }

  const columns = PromotionCodesColumns(handleAssignClick)

  const table = useReactTable({
    data: DUMMY_DATA,
    columns,
    getCoreRowModel: getCoreRowModel(),
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
          <TableTop
            filters={{}}
            onOrderChange={() => {}}
            onEmailChange={() => {}}
            affiliate={false}
            table={table}
            placeholder="Search codes..."
          />

          <TableView
            isPending={false}
            table={table}
            affiliate={false}
            columns={columns}
            tableEmptyText="No coupons found in your Stripe/Paddle account."
          />
        </CardContent>
      </Card>

      {/* TODO: Add AssignAffiliateModal here */}
      <AppDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={`Assign Coupon: ${selectedCode?.code}`}
        description="Connect this synced coupon to an affiliate and define the commission rules."
        confirmText="Save Assignment"
        onConfirm={() => {
          console.log("Saving assignment logic...")
          setIsModalOpen(false)
        }}
        affiliate={false}
      >
        <AssignAffiliateForm />
      </AppDialog>
    </div>
  )
}
