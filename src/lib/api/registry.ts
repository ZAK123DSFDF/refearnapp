import { ActionResult } from "@/lib/types/organization/response"
import { Organization, WebsiteDomain } from "@/lib/types/internal/database"
import {
  AffiliateKpiStats,
  OrganizationKpiStats,
} from "@/lib/types/affiliate/affiliateKpiStats"
import {
  AffiliateKpiTimeSeries,
  OrganizationKpiTimeSeries,
} from "@/lib/types/affiliate/affiliateChartStats"
import {
  AffiliateReferrerStat,
  OrganizationReferrerStat,
} from "@/lib/types/affiliate/affiliateReferrerStat"
import {
  AffiliatePayout,
  AffiliateStats,
} from "@/lib/types/affiliate/affiliateStats"
import { AuthCustomization } from "@/customization/Auth/defaultAuthCustomization"
import { DashboardCustomization } from "@/customization/Dashboard/defaultDashboardCustomization"
import {
  GET_ACTIVE_DOMAIN_PATH,
  GET_AFFILIATE_KPI_PATH,
  GET_AFFILIATE_LINKS_PATH,
  GET_AFFILIATE_PAYMENT,
  GET_AFFILIATE_PAYMENT_METHOD_PATH,
  GET_AFFILIATE_REFERRERS_PATH,
  GET_AFFILIATE_TIME_SERIES_PATH,
  GET_ORG,
  GET_ORG_AFFILIATES_STATS_PATH,
  GET_ORG_CURRENCY_PATH,
  GET_ORG_CUSTOMIZATION_ALL_PATH,
  GET_ORG_CUSTOMIZATION_AUTH_PATH,
  GET_ORG_CUSTOMIZATION_DASHBOARD_PATH,
  GET_ORG_DOMAIN_MANAGE_PATH,
  GET_ORG_KPI_PATH,
  GET_ORG_PAYOUTS_BULK_PATH,
  GET_ORG_PAYOUTS_PATH,
  GET_ORG_PAYOUTS_UNPAID_PATH,
  GET_ORG_PROMOTION_CODES_PATH,
  GET_ORG_REFERRERS_PATH,
  GET_ORG_TEAM_MEMBERS_PATH,
  GET_ORG_TIME_SERIES_PATH,
  GET_ORG_WEBHOOK_KEY_PATH,
  GET_TEAM_AFFILIATES_STATS_PATH,
  GET_TEAM_DOMAIN_MANAGE_PATH,
  GET_TEAM_KPI_PATH,
  GET_TEAM_PAYOUTS_BULK_PATH,
  GET_TEAM_PAYOUTS_PATH,
  GET_TEAM_PAYOUTS_UNPAID_PATH,
  GET_TEAM_PROMOTION_CODES_PATH,
  GET_TEAM_REFERRERS_PATH,
  GET_TEAM_TIME_SERIES_PATH,
  GET_TEAM_WEBHOOK_KEY_PATH,
} from "@/lib/api/paths"
import { AffiliateLinkWithStats } from "@/lib/types/affiliate/affiliateLinkWithStats"
import { AffiliatePaymentRow } from "@/lib/types/affiliate/affiliatePaymentRow"
import { DomainRow } from "@/lib/types/organization/domainRow"
import { PayoutResult } from "@/lib/types/organization/payoutResult"
import { UnpaidMonth } from "@/lib/types/organization/unpaidMonth"
import { TeamRow } from "@/lib/types/internal/teamsRow"
import { PromotionCodeType } from "@/lib/types/organization/promotion"

export const API_CONFIG = {
  affiliate: {
    dashboard: {
      analytics: {
        kpi: {
          path: GET_AFFILIATE_KPI_PATH,
          response: {} as ActionResult<AffiliateKpiStats[]>,
        },
        referrers: {
          path: GET_AFFILIATE_REFERRERS_PATH,
          response: {} as ActionResult<AffiliateReferrerStat[]>,
        },
        timeSeries: {
          path: GET_AFFILIATE_TIME_SERIES_PATH,
          response: {} as ActionResult<AffiliateKpiTimeSeries[]>,
        },
      },
      links: {
        path: GET_AFFILIATE_LINKS_PATH,
        response: {} as ActionResult<AffiliateLinkWithStats[]>,
      },
      payment: {
        path: GET_AFFILIATE_PAYMENT,
        response: {} as ActionResult<AffiliatePaymentRow[]>,
      },
      profile: {
        paymentMethod: {
          path: GET_AFFILIATE_PAYMENT_METHOD_PATH,
          response: {} as ActionResult<AffiliatePaymentMethod>,
        },
      },
    },
  },
  organization: {
    org: {
      path: GET_ORG,
      response: {} as ActionResult<Organization>,
    },
    domain: {
      active: {
        path: GET_ACTIVE_DOMAIN_PATH,
        response: {} as ActionResult<WebsiteDomain | null>,
      },
    },
    currency: {
      path: GET_ORG_CURRENCY_PATH,
      response: {} as ActionResult<string>,
    },
    dashboard: {
      affiliates: {
        path: GET_ORG_AFFILIATES_STATS_PATH,
        response: {} as ActionResult<{
          rows: AffiliateStats[]
          hasNext: boolean
        }>,
      },
      coupons: {
        path: GET_ORG_PROMOTION_CODES_PATH,
        response: {} as ActionResult<{
          rows: PromotionCodeType[]
          hasNext: boolean
        }>,
      },
      analytics: {
        kpi: {
          path: GET_ORG_KPI_PATH,
          response: {} as ActionResult<OrganizationKpiStats[]>,
        },
        referrers: {
          path: GET_ORG_REFERRERS_PATH,
          response: {} as ActionResult<OrganizationReferrerStat[]>,
        },
        timeSeries: {
          path: GET_ORG_TIME_SERIES_PATH,
          response: {} as ActionResult<OrganizationKpiTimeSeries[]>,
        },
      },
      customization: {
        all: {
          path: GET_ORG_CUSTOMIZATION_ALL_PATH,
          response: {} as ActionResult<{
            auth: AuthCustomization
            dashboard: DashboardCustomization
          }>,
        },
        auth: {
          path: GET_ORG_CUSTOMIZATION_AUTH_PATH,
          response: {} as ActionResult<AuthCustomization>,
        },
        dashboard: {
          path: GET_ORG_CUSTOMIZATION_DASHBOARD_PATH,
          response: {} as ActionResult<DashboardCustomization>,
        },
      },
      integration: {
        webhookKey: {
          path: GET_ORG_WEBHOOK_KEY_PATH,
          response: {} as ActionResult<{ webhookPublicKey: string | null }>,
        },
      },
      manageDomains: {
        path: GET_ORG_DOMAIN_MANAGE_PATH,
        response: {} as ActionResult<{
          rows: DomainRow[]
          hasNext: boolean
        }>,
      },
      payout: {
        affiliateBulkPayout: {
          path: GET_ORG_PAYOUTS_BULK_PATH,
          response: {} as ActionResult<PayoutResult<AffiliatePayout>>,
        },
        affiliatePayout: {
          path: GET_ORG_PAYOUTS_PATH,
          response: {} as ActionResult<PayoutResult<AffiliatePayout>>,
        },
        unpaidMonths: {
          path: GET_ORG_PAYOUTS_UNPAID_PATH,
          response: {} as ActionResult<UnpaidMonth[]>,
        },
      },
      teams: {
        path: GET_ORG_TEAM_MEMBERS_PATH,
        response: {} as ActionResult<{
          rows: TeamRow[]
          hasNext: boolean
        }>,
      },
    },
    teams: {
      dashboard: {
        affiliates: {
          path: GET_TEAM_AFFILIATES_STATS_PATH,
          response: {} as ActionResult<{
            rows: AffiliateStats[]
            hasNext: boolean
          }>,
        },
        coupons: {
          path: GET_TEAM_PROMOTION_CODES_PATH,
          response: {} as ActionResult<{
            rows: PromotionCodeType[]
            hasNext: boolean
          }>,
        },
        analytics: {
          kpi: {
            path: GET_TEAM_KPI_PATH,
            response: {} as ActionResult<OrganizationKpiStats[]>,
          },
          referrers: {
            path: GET_TEAM_REFERRERS_PATH,
            response: {} as ActionResult<OrganizationReferrerStat[]>,
          },
          timeSeries: {
            path: GET_TEAM_TIME_SERIES_PATH,
            response: {} as ActionResult<OrganizationKpiTimeSeries[]>,
          },
        },
        integration: {
          webhookKey: {
            path: GET_TEAM_WEBHOOK_KEY_PATH,
            response: {} as ActionResult<{ webhookPublicKey: string | null }>,
          },
        },
        manageDomains: {
          path: GET_TEAM_DOMAIN_MANAGE_PATH,
          response: {} as ActionResult<{
            rows: DomainRow[]
            hasNext: boolean
          }>,
        },
        payout: {
          affiliateBulkPayout: {
            path: GET_TEAM_PAYOUTS_BULK_PATH,
            response: {} as ActionResult<PayoutResult<AffiliatePayout>>,
          },
          affiliatePayout: {
            path: GET_TEAM_PAYOUTS_PATH,
            response: {} as ActionResult<PayoutResult<AffiliatePayout>>,
          },
          unpaidMonths: {
            path: GET_TEAM_PAYOUTS_UNPAID_PATH,
            response: {} as ActionResult<UnpaidMonth[]>,
          },
        },
      },
    },
  },
} as const

export type ApiRegistry = typeof API_CONFIG
