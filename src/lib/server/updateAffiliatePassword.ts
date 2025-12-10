"use server"

import * as bcrypt from "bcrypt"
import { affiliateAccount } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { decodedType } from "@/lib/types/decodedType"
import { getDB } from "@/db/drizzle"

export const updateAffiliatePasswordAction = async (
  decoded: decodedType,
  newPassword: string
) => {
  const hashed = await bcrypt.hash(newPassword, 10)
  const db = await getDB()
  const result = await db
    .update(affiliateAccount)
    .set({ password: hashed })
    .where(
      and(
        eq(affiliateAccount.affiliateId, decoded.id),
        eq(affiliateAccount.provider, "credentials")
      )
    )
    .returning()

  if (!result.length) {
    throw {
      status: 404,
      error: "Affiliate account not found",
      toast: "Could not update password, account missing",
    }
  }
}
