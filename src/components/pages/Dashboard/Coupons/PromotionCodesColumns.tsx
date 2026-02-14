"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlus, Settings, Clock } from "lucide-react"

export type PromotionCodeDummy = {
  id: string
  code: string
  status: "active" | "inactive"
  affiliateName: string | null
  discountValue: string
  discountType: "PERCENTAGE" | "FLAT_FEE"
  commissionValue?: string
  commissionType?: "PERCENTAGE" | "FLAT_FEE"
  durationValue?: string
  durationUnit?: string
}

export const PromotionCodesColumns = (
  onAssign: (code: PromotionCodeDummy) => void
): ColumnDef<PromotionCodeDummy>[] => [
  {
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => (
      <span className="font-mono font-bold text-blue-600">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "active" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) =>
      `${row.original.discountValue}${row.original.discountType === "PERCENTAGE" ? "%" : "$"}`,
  },
  {
    accessorKey: "commission",
    header: "Affiliate Commission",
    cell: ({ row }) => {
      const { affiliateName, commissionValue, commissionType } = row.original
      // Check for both name and value
      if (!affiliateName || !commissionValue)
        return <span className="text-muted-foreground">-</span>

      return (
        <span className="font-medium">
          {commissionValue}
          {commissionType === "PERCENTAGE" ? "%" : "$"}
        </span>
      )
    },
  },
  {
    accessorKey: "duration",
    header: "Commission Duration",
    cell: ({ row }) => {
      const { affiliateName, durationValue, durationUnit } = row.original
      if (!affiliateName || !durationValue)
        return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            {durationValue} {durationUnit}(s)
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "affiliateName",
    header: "Assigned To",
    cell: ({ row }) =>
      row.original.affiliateName ?? (
        <span className="text-muted-foreground italic">Unassigned</span>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isAssigned = !!row.original.affiliateName
      return (
        <Button
          variant={isAssigned ? "outline" : "default"}
          size="sm"
          onClick={() => onAssign(row.original)}
          className="gap-2"
        >
          {isAssigned ? (
            <Settings className="h-4 w-4" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {isAssigned ? "Edit" : "Assign"}
        </Button>
      )
    },
  },
]
