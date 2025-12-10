"use server"
import { affiliatePayoutMethod } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { decodedType } from "@/lib/types/decodedType"
import { getDB } from "@/db/drizzle"
export const getPayoutEmailMethod = async (decoded: decodedType) => {
  const db = await getDB()
  return db.query.affiliatePayoutMethod.findFirst({
    where: and(
      eq(affiliatePayoutMethod.affiliateId, decoded.id),
      eq(affiliatePayoutMethod.provider, "paypal")
    ),
  })
}
