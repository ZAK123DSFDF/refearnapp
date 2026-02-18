// @/components/pages/AffiliateDashboard/AffiliateCoupon/affiliateCouponColumns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Info, Copy } from "lucide-react"
import { formatCurrency } from "@/util/Formatter"
import { AffiliateCouponData } from "@/lib/types/affiliate/affiliateCouponData"

export const affiliateCouponColumns = (
  onDetails: (coupon: AffiliateCouponData) => void,
  showCustomToast: any
): ColumnDef<AffiliateCouponData>[] => [
  {
    accessorKey: "code",
    header: "Coupon Code",
    cell: ({ row }) => {
      const code = row.original.code
      const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => console.log("copied"))
        showCustomToast({
          type: "success",
          title: "Copied!",
          description: `Code ${code} copied to clipboard.`,
          affiliate: true,
        })
      }
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
            {code}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      )
    },
  },
  {
    accessorKey: "discountValue",
    header: "User Discount",
    cell: ({ row }) => {
      const { discountValue, discountType, currency } = row.original
      const isFlat = discountType === "FLAT_FEE"

      return (
        <span className="font-medium">
          {isFlat
            ? `${formatCurrency(Number(discountValue), currency)} OFF`
            : `${discountValue}% OFF`}
        </span>
      )
    },
  },
  {
    accessorKey: "commissionValue",
    header: "Your Reward",
    cell: ({ row }) => {
      const { commissionValue, commissionType, currency } = row.original
      const isFlat = commissionType === "FLAT_FEE"

      return (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-700 hover:bg-green-100 border-none"
        >
          {isFlat
            ? formatCurrency(Number(commissionValue), currency)
            : `${commissionValue}%`}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const isNew = !row.original.isSeenByAffiliate
      return (
        <div className="relative inline-block">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => onDetails(row.original)}
          >
            <Info className="h-4 w-4" />
            Details
          </Button>
          {isNew && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </div>
      )
    },
  },
]
