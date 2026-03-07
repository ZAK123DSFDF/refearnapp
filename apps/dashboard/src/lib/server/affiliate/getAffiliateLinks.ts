import { db } from "@/db/drizzle"
import { affiliate, affiliateLink, promotionCodes } from "@/db/schema"
import { and, eq } from "drizzle-orm"

export async function getAffiliateLinks(decoded: {
  orgId: string
  id: string
}) {
  const affiliates = await db
    .select({
      affiliateId: affiliate.id,
      name: affiliate.name,
      email: affiliate.email,
    })
    .from(affiliate)
    .where(
      and(
        eq(affiliate.organizationId, decoded.orgId),
        eq(affiliate.id, decoded.id)
      )
    )

  if (!affiliates.length) return { affiliates: [], linkIds: [], promoIds: [] }

  const affiliateId = affiliates[0].affiliateId

  const links = await db
    .select({ id: affiliateLink.id, createdAt: affiliateLink.createdAt })
    .from(affiliateLink)
    .where(
      and(
        eq(affiliateLink.affiliateId, affiliateId),
        eq(affiliateLink.organizationId, decoded.orgId)
      )
    )
  const promos = await db
    .select({ id: promotionCodes.id })
    .from(promotionCodes)
    .where(eq(promotionCodes.affiliateId, affiliateId))
  return {
    affiliates,
    linkIds: links.map((l) => l.id),
    promoIds: promos.map((p) => p.id),
    links,
  }
}
