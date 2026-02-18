import { OrderDir } from "@/lib/types/analytics/orderTypes"
import { PayoutSortKeys } from "@/lib/types/organization/PayoutSortKeys"

export interface ExportAffiliatePayoutsBulk {
  orgId: string
  months: { year: number; month: number }[]
  orderBy?: PayoutSortKeys
  orderDir?: OrderDir
  email?: string
}
