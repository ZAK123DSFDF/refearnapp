import { OrderDir, OrderBy } from "@/lib/types/orderTypes"
export interface ExportAffiliatePayouts {
  orgId: string
  year?: number
  month?: number
  orderBy?: OrderBy
  orderDir?: OrderDir
  email?: string
}
