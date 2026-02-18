"use client"

import React from "react"
import { Copy, Ticket, Share2, TrendingUp } from "lucide-react"
import { useCustomToast } from "@/components/ui-custom/ShowCustomToast"
import { AffiliateCouponData } from "@/lib/types/affiliate/affiliateCouponData"

interface AffiliateCouponDetailsProps {
  coupon: AffiliateCouponData
}

export function AffiliateCouponDetails({
  coupon,
}: AffiliateCouponDetailsProps) {
  const { showCustomToast } = useCustomToast()

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => console.log("Copied"))
    showCustomToast({
      type: "success",
      title: "Code Copied!",
      description: `Coupon code ${code} is ready to share.`,
      affiliate: true,
    })
  }

  return (
    <div className="space-y-6 pt-4">
      {/* Code Block */}
      <div
        className="flex items-center justify-between p-4 border-2 border-dashed rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors"
        onClick={() => copyCode(coupon.code)}
      >
        <div>
          <p className="text-xs text-muted-foreground uppercase font-semibold">
            Click to copy code
          </p>
          <p className="text-2xl font-mono font-bold text-primary">
            {coupon.code}
          </p>
        </div>
        <Copy className="h-6 w-6 text-muted-foreground" />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 border rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
            <Ticket className="h-4 w-4" /> User Discount
          </div>
          <p className="font-bold text-lg">
            {coupon.discountValue}
            {coupon.discountType === "PERCENTAGE" ? "%" : "$"} OFF
          </p>
        </div>
        <div className="p-3 border rounded-md">
          <div className="flex items-center gap-2 text-muted-foreground mb-1 text-sm">
            <TrendingUp className="h-4 w-4" /> Your Reward
          </div>
          <p className="font-bold text-lg text-green-600">
            {coupon.commissionValue}
            {coupon.commissionType === "PERCENTAGE" ? "%" : "$"}
          </p>
        </div>
      </div>

      {/* Strategy Box */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
        <Share2 className="h-5 w-5 text-blue-500 shrink-0" />
        <div className="text-sm text-blue-800">
          <strong>How to use:</strong> Share this coupon with your audience.
          When they use it at checkout, they get a discount and you will earn
          commission for the next
          <strong>
            {" "}
            {coupon.durationValue} {coupon.durationUnit}(s)
          </strong>{" "}
          of their subscription.
        </div>
      </div>
    </div>
  )
}
