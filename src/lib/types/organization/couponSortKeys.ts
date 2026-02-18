// @/lib/types/organization/CouponSortKeys.ts
import { OrderBy } from "@/lib/types/analytics/orderTypes"

/** * We use 'Extract' to ensure these keys always exist in our Master OrderBy union.
 * This prevents typos and keeps things synchronized.
 */
export type CouponSortKeys = Extract<
  OrderBy,
  "code" | "createdAt" | "name" | "email" | "none"
>

export const COUPON_SORT_OPTIONS: CouponSortKeys[] = [
  "none",
  "code",
  "name",
  "email",
  "createdAt",
]
