import {
  DollarSign,
  Grid3X3,
  Link2,
  ShoppingCart,
  Users,
  Wallet,
  XCircle,
} from "lucide-react"
import { AffiliateKpiStats } from "@/lib/types/affiliateKpiStats"

export const initialKpiData = [
  {
    label: "Total Affiliates",
    value: 28,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    label: "Total Links",
    value: 41,
    icon: Link2,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    label: "Total Visitors",
    value: 1403,
    icon: Grid3X3,
    color: "text-amber-600",
    bg: "bg-amber-100",
  },
  {
    label: "Total Sales",
    value: 98,
    icon: ShoppingCart,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    label: "Total Amount",
    value: "$4,150",
    icon: DollarSign,
    color: "text-emerald-600",
    bg: "bg-emerald-100",
  },
  {
    label: "Total Commission",
    value: "$4,150",
    icon: DollarSign,
    color: "text-orange-600",
    bg: "bg-orange-100",
  },
  {
    label: "Commission Paid",
    value: "$2,200",
    icon: Wallet,
    color: "text-indigo-600",
    bg: "bg-indigo-100",
  },
  {
    label: "Commission Unpaid",
    value: "$1,950",
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
]
export const getDummyAffiliateStats = (
  currency: string = "USD"
): AffiliateKpiStats => ({
  totalLinks: 45,
  totalVisitors: 1250,
  totalSales: 84,
  totalCommission: 3200.5,
  totalCommissionPaid: 2100.0,
  totalCommissionUnpaid: 1100.5,
  currency: currency,
})
export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const years = [2023, 2024, 2025]
