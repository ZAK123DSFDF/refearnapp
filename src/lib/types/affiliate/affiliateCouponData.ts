export type AffiliateCouponData = {
  id: string
  code: string
  discountValue: string
  discountType: "PERCENTAGE" | "FLAT_FEE"
  commissionValue: string
  commissionType: "PERCENTAGE" | "FLAT_FEE"
  durationValue: number
  durationUnit: string
  isSeenByAffiliate: boolean
  currency: string
  createdAt: Date
}
