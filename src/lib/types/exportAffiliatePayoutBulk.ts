import { OrderDir, OrderBy } from "@/lib/types/orderTypes"

export interface ExportAffiliatePayoutsBulk {
  orgId: string
  months: { year: number; month: number }[]
  orderBy?: OrderBy
  orderDir?: OrderDir
  email?: string
}
