export interface CreatePayoutInput {
  orgId: string
  affiliateIds: string[]
  isUnpaid: boolean
  months: { year: number; month?: number }[]
}
