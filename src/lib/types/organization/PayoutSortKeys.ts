import { OrderBy } from "@/lib/types/analytics/orderTypes"

export type PayoutSortKeys = Extract<
  OrderBy,
  | "none"
  | "sales"
  | "commission"
  | "conversionRate"
  | "visits"
  | "email"
  | "commissionPaid"
  | "commissionUnpaid"
>
