"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserPlus, Settings, Clock, Mail } from "lucide-react"
import { PromotionCodeType } from "@/lib/types/organization/promotion"

export const PromotionCodesColumns = (
  onAssign: (code: PromotionCodeType) => void
): ColumnDef<PromotionCodeType>[] => [
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
        className="capitalize"
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "discountValue",
    header: "Discount",
    cell: ({ row }) => {
      const { discountValue, discountType } = row.original
      return (
        <span className="font-medium">
          {discountType === "FLAT_FEE" ? "$" : ""}
          {discountValue}
          {discountType === "PERCENTAGE" ? "%" : ""}
        </span>
      )
    },
  },
  {
    accessorKey: "commissionValue",
    header: "Affiliate Commission",
    cell: ({ row }) => {
      const { affiliateName, commissionValue, commissionType } = row.original
      if (!affiliateName || !commissionValue)
        return <span className="text-muted-foreground">-</span>

      return (
        <span className="font-medium text-green-600">
          {commissionType === "FLAT_FEE" ? "$" : ""}
          {commissionValue}
          {commissionType === "PERCENTAGE" ? "%" : ""}
        </span>
      )
    },
  },
  {
    accessorKey: "commissionDurationValue", // Fixed inconsistent key
    header: "Duration",
    cell: ({ row }) => {
      const { affiliateName, commissionDurationValue, commissionDurationUnit } =
        row.original
      if (!affiliateName || commissionDurationValue === null)
        return <span className="text-muted-foreground">-</span>

      return (
        <div className="flex items-center gap-1.5 text-sm">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="capitalize">
            {commissionDurationValue} {commissionDurationUnit}(s)
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "affiliateName",
    header: "Assigned To",
    cell: ({ row }) => {
      const { affiliateName, affiliateEmail } = row.original

      if (!affiliateName) {
        return (
          <span className="text-muted-foreground italic text-sm">
            Unassigned
          </span>
        )
      }

      return (
        <div className="flex flex-col">
          <span className="font-medium text-sm">{affiliateName}</span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {affiliateEmail}
          </span>
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isAssigned = !!row.original.affiliateName
      return (
        <div className="text-right">
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
        </div>
      )
    },
  },
]
