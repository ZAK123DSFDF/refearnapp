"use client"

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import { OrderDir, OrderBy } from "@/lib/types/analytics/orderTypes"
import { cn } from "@/lib/utils"
import { ArrowDown, ArrowDownUp, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMemo } from "react"

interface Props<T extends string> {
  value: { orderBy?: T; orderDir?: OrderDir }
  onChange: (orderBy?: T, orderDir?: OrderDir) => void
  affiliate: boolean
  options?: OrderBy[]
}

export default function OrderSelect<T extends string>({
  value,
  onChange,
  affiliate,
  options,
}: Props<T>) {
  const isNone = !value.orderBy || value.orderBy === "none"
  const activeDir = value.orderDir ?? undefined
  const ALL_OPTIONS: Record<OrderBy, string> = {
    none: "None",
    sales: "Sales",
    commission: "Commission",
    conversionRate: "Conversion Rate",
    visits: "Visits",
    name: "Name",
    commissionPaid: "Commission Paid",
    commissionUnpaid: "Commission Unpaid",
    email: "Email",
    code: "Coupon Code",
    createdAt: "Date Created",
  }

  const filteredOptions = useMemo(() => {
    if (!options) {
      const defaultKeys: OrderBy[] = [
        "none",
        "sales",
        "commission",
        "conversionRate",
        "visits",
        "email",
        "commissionPaid",
        "commissionUnpaid",
      ]
      return defaultKeys.map((key) => ({ value: key, label: ALL_OPTIONS[key] }))
    }
    const activeKeys = options.includes("none")
      ? options
      : (["none", ...options] as OrderBy[])
    return activeKeys.map((key) => ({
      value: key,
      label: ALL_OPTIONS[key] || key.charAt(0).toUpperCase() + key.slice(1),
    }))
  }, [options])

  const cycleDirection = () => {
    if (!activeDir) {
      onChange(value.orderBy, "asc")
    } else if (activeDir === "asc") {
      onChange(value.orderBy, "desc")
    } else {
      onChange(value.orderBy, undefined)
    }
  }

  return (
    <div className="flex gap-2">
      <Select
        value={value.orderBy ?? "none"}
        onValueChange={(val) => {
          if (val === "none") {
            onChange(undefined, undefined)
          } else {
            onChange(val as T, undefined)
          }
        }}
      >
        <SelectTrigger affiliate={affiliate} className="w-[140px]">
          <SelectValue placeholder="Order By" />
        </SelectTrigger>
        <SelectContent affiliate={affiliate}>
          {filteredOptions.map((opt) => (
            <SelectItem key={opt.value} affiliate={affiliate} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant={activeDir ? "default" : "outline"}
        size="icon"
        disabled={isNone}
        onClick={cycleDirection}
        className={cn(
          "p-0 h-9 w-9 flex items-center justify-center",
          isNone && "opacity-50 cursor-not-allowed"
        )}
      >
        {!activeDir && (
          <ArrowDownUp className="h-3.5 w-3.5 text-muted-foreground" />
        )}
        {activeDir === "asc" && <ArrowUp className="h-3.5 w-3.5" />}
        {activeDir === "desc" && <ArrowDown className="h-3.5 w-3.5" />}
      </Button>
    </div>
  )
}
