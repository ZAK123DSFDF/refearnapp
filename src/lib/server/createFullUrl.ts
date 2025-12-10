"use server"
import { generateAffiliateCode } from "@/util/idGenerators"
import { affiliateLink } from "@/db/schema"
import { getDB } from "@/db/drizzle"

export const createFullUrl = async (decoded: { id: string; orgId: string }) => {
  const db = await getDB()
  const org = await db.query.organization.findFirst({
    where: (o, { eq }) => eq(o.id, decoded.orgId),
  })
  if (!org) {
    throw { status: 500, toast: "failed to fetch organization data" }
  }
  const existingLinks = await db.query.affiliateLink.findMany({
    where: (a, { eq }) => eq(a.affiliateId, decoded.id),
  })

  if (existingLinks.length >= 10) {
    throw {
      status: 400,
      toast: "You have reached the maximum of 10 affiliate links.",
    }
  }
  const code = generateAffiliateCode() // e.g., "7hjKpQ"
  const param = org.referralParam
  const domain = org.websiteUrl.replace(/^https?:\/\//, "")

  const fullUrl = `https://${domain}/?${param}=${code}`

  await db.insert(affiliateLink).values({
    id: code,
    affiliateId: decoded.id,
    organizationId: decoded.orgId,
  })
  return { org, fullUrl }
}
