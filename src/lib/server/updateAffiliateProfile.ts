"use server"
import { affiliate, affiliatePayoutMethod } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { decodedType } from "@/lib/types/decodedType"
import { getDB } from "@/db/drizzle"

export const updateAffiliateProfileAction = async (
  decoded: decodedType,
  data: { name?: string; paypalEmail?: string }
) => {
  const db = await getDB()
  if (data.name) {
    await db
      .update(affiliate)
      .set({ name: data.name })
      .where(eq(affiliate.id, decoded.id))
  }

  if (data.paypalEmail) {
    const existing = await db.query.affiliatePayoutMethod.findFirst({
      where: and(
        eq(affiliatePayoutMethod.affiliateId, decoded.id),
        eq(affiliatePayoutMethod.provider, "paypal")
      ),
    })

    if (existing) {
      await db
        .update(affiliatePayoutMethod)
        .set({ accountIdentifier: data.paypalEmail, updatedAt: new Date() })
        .where(eq(affiliatePayoutMethod.id, existing.id))
    } else {
      await db.insert(affiliatePayoutMethod).values({
        affiliateId: decoded.id,
        provider: "paypal",
        accountIdentifier: data.paypalEmail,
        isDefault: true,
      })
    }
  }
}
