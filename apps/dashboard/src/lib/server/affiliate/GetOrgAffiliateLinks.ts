import { db } from "@/db/drizzle"
import { affiliate, affiliateLink, promotionCodes } from "@/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { OrgAuthResult } from "@/lib/types/organization/orgAuth"

export async function getOrgAffiliateLinks(org: OrgAuthResult, orgId: string) {
  const affRows = await db
    .select({ id: affiliate.id, email: affiliate.email })
    .from(affiliate)
    .where(eq(affiliate.organizationId, orgId))

  if (!affRows.length) {
    return { linkIds: [], promoIds: [], affRows: [], linksByAffiliate: {} }
  }

  const affIds = affRows.map((a) => a.id)

  const allLinks = await db
    .select({ id: affiliateLink.id, affId: affiliateLink.affiliateId })
    .from(affiliateLink)
    .where(
      and(
        eq(affiliateLink.organizationId, orgId),
        inArray(affiliateLink.affiliateId, affIds)
      )
    )
  const allPromos = await db
    .select({ id: promotionCodes.id, affId: promotionCodes.affiliateId })
    .from(promotionCodes)
    .where(inArray(promotionCodes.affiliateId, affIds))
  const linksByAffiliate: Record<string, string[]> = {}
  const linkIds: string[] = []
  const promoIds = allPromos.map((p) => p.id)
  allLinks.forEach((l) => {
    const url = `https://${org.domain}/?${org.param}=${l.id}`
    ;(linksByAffiliate[l.affId] ||= []).push(url)
    linkIds.push(l.id)
  })

  return { linkIds, promoIds, affRows, linksByAffiliate }
}
