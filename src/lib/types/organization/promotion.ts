// src/types/promotion.ts
import { ValueType, DurationUnit } from "@/db/schema"

export type PromotionCodeType = {
  id: string
  code: string
  status: "active" | "inactive"
  discountValue: string
  discountType: ValueType
  commissionValue: string | null
  commissionType: ValueType | null
  commissionDurationValue: number | null
  commissionDurationUnit: DurationUnit | null
  affiliateName: string | null
  affiliateEmail: string | null
  createdAt: Date
}
