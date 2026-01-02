"use server"
import { db } from "@/db/drizzle"
import { generateAffiliateCode } from "@/util/idGenerators"
import { affiliateLink } from "@/db/schema"
import { redis } from "@/lib/redis"

export const createFullUrl = async (decoded: { id: string; orgId: string }) => {
  const org = await db.query.organization.findFirst({
    where: (o, { eq }) => eq(o.id, decoded.orgId),
  })
  if (!org) {
    throw { status: 500, toast: "failed to fetch organization data" }
  }
  const [userSub, userPurchase] = await Promise.all([
    db.query.subscription.findFirst({
      where: (s, { eq }) => eq(s.userId, org.userId),
    }),
    db.query.purchase.findFirst({
      where: (p, { eq }) => eq(p.userId, org.userId),
    }),
  ])
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
  const planType = userPurchase ? userPurchase.tier : userSub?.plan || "FREE"
  const paymentType = userPurchase ? "ONE-TIME" : "SUBSCRIPTION"
  const expiresAt = userSub?.expiresAt
    ? userSub.expiresAt.toISOString()
    : "null"
  await redis.hset(`ref:${code}`, {
    orgId: org.id,
    ownerId: org.userId,
    planType,
    paymentType,
    expiresAt,
    name: org.name,
    websiteUrl: domain,
    referralParam: org.referralParam || "ref",
    cookieLifetimeValue: String(org.cookieLifetimeValue),
    cookieLifetimeUnit: org.cookieLifetimeUnit || "day",
    commissionType: org.commissionType || "percentage",
    commissionValue: String(org.commissionValue),
    commissionDurationValue: String(org.commissionDurationValue),
    commissionDurationUnit: org.commissionDurationUnit || "day",
    attributionModel: org.attributionModel,
    currency: org.currency,
  })
  return { org, fullUrl }
}
