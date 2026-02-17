import { withQuery } from "@/lib/api/utils"
import { OrderDir, OrderBy } from "@/lib/types/analytics/orderTypes"

// =============================================================================
// 🤳 AFFILIATE DASHBOARD PATHS
// =============================================================================

export const GET_AFFILIATE_KPI_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/affiliate/${orgId}/dashboard/analytics/kpi`, { year, month })
export const GET_AFFILIATE_REFERRERS_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/affiliate/${orgId}/dashboard/analytics/referrers`, {
    year,
    month,
  })
export const GET_AFFILIATE_TIME_SERIES_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/affiliate/${orgId}/dashboard/analytics/time-series`, {
    year,
    month,
  })
export const GET_AFFILIATE_LINKS_PATH = (
  orgId: string,
  year?: number,
  month?: number
) => withQuery(`/api/affiliate/${orgId}/dashboard/links`, { year, month })
export const GET_AFFILIATE_PAYMENT = (orgId: string, year?: number) =>
  withQuery(`/api/affiliate/${orgId}/dashboard/payment`, { year })
export const GET_AFFILIATE_PAYMENT_METHOD_PATH = (orgId: string) =>
  `/api/affiliate/${orgId}/dashboard/profile/payment-method`

// =============================================================================
// 🏢 ORGANIZATION (OWNER) DASHBOARD PATHS
// =============================================================================
export const GET_AFFILIATE_LOOKUP_PATH = (
  orgId: string,
  query: { offset: number; context: "admin" | "team"; search?: string }
) => withQuery(`/api/organization/${orgId}/affiliate-lookup`, query)
export const GET_ORG = (
  orgId: string,
  context: "public" | "affiliate" | "admin" | "team" = "public"
) => `/api/organization/${orgId}?context=${context}`
export const GET_ORG_PROMOTION_CODES_PATH = (
  orgId: string,
  query: { offset?: number; code?: string }
) => withQuery(`/api/organization/${orgId}/dashboard/coupons`, query)
export const GET_ORG_AFFILIATES_STATS_PATH = (
  orgId: string,
  query: {
    year?: number
    month?: number
    orderBy?: OrderBy
    orderDir?: OrderDir
    offset?: number
    email?: string
  }
) => withQuery(`/api/organization/${orgId}/dashboard/affiliates`, query)
export const GET_ORG_KPI_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/organization/${orgId}/dashboard/analytics/kpi`, {
    year,
    month,
  })
export const GET_ORG_REFERRERS_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/organization/${orgId}/dashboard/analytics/referrers`, {
    year,
    month,
  })
export const GET_ORG_TIME_SERIES_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/organization/${orgId}/dashboard/analytics/time-series`, {
    year,
    month,
  })
export const GET_ORG_CUSTOMIZATION_ALL_PATH = (orgId: string) =>
  `/api/organization/${orgId}/dashboard/customization/all`
export const GET_ORG_CUSTOMIZATION_AUTH_PATH = (orgId: string) =>
  `/api/organization/${orgId}/dashboard/customization/auth`
export const GET_ORG_CUSTOMIZATION_DASHBOARD_PATH = (orgId: string) =>
  `/api/organization/${orgId}/dashboard/customization/dashboard`
export const GET_ORG_WEBHOOK_KEY_PATH = (orgId: string) =>
  `/api/organization/${orgId}/dashboard/integration/webhook-key`
export const GET_ORG_DOMAIN_MANAGE_PATH = (
  orgId: string,
  query: { offset?: number; domain?: string }
) => withQuery(`/api/organization/${orgId}/dashboard/manage-domains`, query)
export const GET_ORG_PAYOUTS_BULK_PATH = (
  orgId: string,
  query: {
    months: { month: number; year: number }[]
    mode?: "TABLE" | "EXPORT"
    offset?: number
    email?: string
    orderBy?: OrderBy
    orderDir?: OrderDir
  }
) =>
  withQuery(
    `/api/organization/${orgId}/dashboard/payout/affiliateBulkPayout`,
    query
  )
export const GET_ORG_PAYOUTS_PATH = (
  orgId: string,
  query: {
    year?: number
    month?: number
    mode?: "TABLE" | "EXPORT"
    offset?: number
    email?: string
    orderBy?: OrderBy
    orderDir?: OrderDir
  }
) =>
  withQuery(
    `/api/organization/${orgId}/dashboard/payout/affiliatePayout`,
    query
  )
export const GET_PROMOTION_SETTINGS = (
  orgId: string,
  codeId: string,
  context: "admin" | "team"
) =>
  withQuery(`/api/organization/${orgId}/promotion-codes/${codeId}/settings`, {
    context,
  })
export const GET_ORG_PAYOUTS_UNPAID_PATH = (orgId: string) =>
  `/api/organization/${orgId}/dashboard/payout/unpaid-months`
export const GET_ORG_TEAM_MEMBERS_PATH = (
  orgId: string,
  query: { offset?: number; email?: string }
) => withQuery(`/api/organization/${orgId}/dashboard/teams`, query)
export const GET_ACTIVE_DOMAIN_PATH = (orgId: string) =>
  `/api/organization/${orgId}/domain/active`
export const GET_ORG_CURRENCY_PATH = (
  orgId: string,
  context?: "admin" | "team" | "affiliate"
) =>
  `/api/organization/${orgId}/currency${context ? `?context=${context}` : ""}`

// =============================================================================
// 👥 TEAM (STAFF) DASHBOARD PATHS
// =============================================================================

export const GET_TEAM_PROMOTION_CODES_PATH = (
  orgId: string,
  query: { offset?: number; code?: string }
) => withQuery(`/api/organization/${orgId}/teams/dashboard/coupons`, query)
export const GET_TEAM_AFFILIATES_STATS_PATH = (
  orgId: string,
  query: {
    year?: number
    month?: number
    orderBy?: OrderBy
    orderDir?: OrderDir
    offset?: number
    email?: string
  }
) => withQuery(`/api/organization/${orgId}/teams/dashboard/affiliates`, query)
export const GET_TEAM_KPI_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/organization/${orgId}/teams/dashboard/analytics/kpi`, {
    year,
    month,
  })
export const GET_TEAM_REFERRERS_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(`/api/organization/${orgId}/teams/dashboard/analytics/referrers`, {
    year,
    month,
  })
export const GET_TEAM_TIME_SERIES_PATH = (
  orgId: string,
  year?: number,
  month?: number
) =>
  withQuery(
    `/api/organization/${orgId}/teams/dashboard/analytics/time-series`,
    { year, month }
  )
export const GET_TEAM_WEBHOOK_KEY_PATH = (orgId: string) =>
  `/api/organization/${orgId}/teams/dashboard/integration/webhook-key`
export const GET_TEAM_DOMAIN_MANAGE_PATH = (
  orgId: string,
  query: { offset?: number; domain?: string }
) =>
  withQuery(`/api/organization/${orgId}/teams/dashboard/manage-domains`, query)
export const GET_TEAM_PAYOUTS_BULK_PATH = (
  orgId: string,
  query: {
    months: { month: number; year: number }[]
    mode?: "TABLE" | "EXPORT"
    offset?: number
    email?: string
    orderBy?: OrderBy
    orderDir?: OrderDir
  }
) =>
  withQuery(
    `/api/organization/${orgId}/teams/dashboard/payout/affiliateBulkPayout`,
    query
  )
export const GET_TEAM_PAYOUTS_PATH = (
  orgId: string,
  query: {
    year?: number
    month?: number
    mode?: "TABLE" | "EXPORT"
    offset?: number
    email?: string
    orderBy?: OrderBy
    orderDir?: OrderDir
  }
) =>
  withQuery(
    `/api/organization/${orgId}/teams/dashboard/payout/affiliatePayout`,
    query
  )
export const GET_TEAM_PAYOUTS_UNPAID_PATH = (orgId: string) =>
  `/api/organization/${orgId}/teams/dashboard/payout/unpaid-months`
