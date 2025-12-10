"use server"
import { affiliate, affiliateLink } from "@/db/schema"
import { and, eq, inArray } from "drizzle-orm"
import { OrgAuthResult } from "@/lib/types/orgAuth"
import { getDB } from "@/db/drizzle"

export async function getOrgAffiliateLinks(org: OrgAuthResult, orgId: string) {
  const db = await getDB()
  const affRows = await db
    .select({ id: affiliate.id, email: affiliate.email })
    .from(affiliate)
    .where(eq(affiliate.organizationId, orgId))

  if (!affRows.length) {
    return { linkIds: [], affRows: [], linksByAffiliate: {} }
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

  const linksByAffiliate: Record<string, string[]> = {}
  const linkIds: string[] = []

  allLinks.forEach((l) => {
    const url = `https://${org.domain}/?${org.param}=${l.id}`
    ;(linksByAffiliate[l.affId] ||= []).push(url)
    linkIds.push(l.id)
  })

  return { linkIds, affRows, linksByAffiliate }
}
