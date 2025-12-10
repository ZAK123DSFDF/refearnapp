"use server"
import { eq } from "drizzle-orm"
import { affiliate } from "@/db/schema"
import { decodedType } from "@/lib/types/decodedType"
import { getPayoutEmailMethod } from "@/lib/server/getPayoutEmailMethod"
import { getDB } from "@/db/drizzle"

export const getAffiliateDataAction = async (decoded: decodedType) => {
  const db = await getDB()
  const affiliateData = await db.query.affiliate.findFirst({
    where: eq(affiliate.id, decoded.id),
  })

  if (!affiliateData) {
    throw {
      status: 404,
      error: "User not found",
      toast: "Your account could not be found.",
    }
  }

  // Fetch PayPal payout method (if any)
  const paypalMethod = await getPayoutEmailMethod(decoded)

  return {
    ...affiliateData,
    paypalEmail: paypalMethod?.accountIdentifier ?? null,
  }
}
