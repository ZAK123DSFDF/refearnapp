"use server"
import { eq, and } from "drizzle-orm"
import { affiliateAccount } from "@/db/schema"
import * as bcrypt from "bcryptjs"
import { decodedType } from "@/lib/types/decodedType"
import { getDB } from "@/db/drizzle"

export const validateAffiliatePasswordAction = async (
  decoded: decodedType,
  currentPassword: string
) => {
  const db = await getDB()
  const account = await db.query.affiliateAccount.findFirst({
    where: and(
      eq(affiliateAccount.affiliateId, decoded.id),
      eq(affiliateAccount.provider, "credentials")
    ),
  })

  if (!account || !account.password) {
    throw {
      status: 404,
      error: "Affiliate account not found",
      toast: "Account not found",
    }
  }

  const isMatch = await bcrypt.compare(currentPassword, account.password)
  if (!isMatch) {
    throw {
      status: 403,
      error: "Incorrect current password",
      toast: "Incorrect current password",
      data: currentPassword,
    }
  }
}
