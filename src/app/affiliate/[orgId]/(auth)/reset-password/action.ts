// app/affiliate/[orgId]/reset-password/action.ts
"use server"
import { affiliateAccount } from "@/db/schema"
import * as bcrypt from "bcryptjs"
import { eq, and } from "drizzle-orm"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import { buildAffiliateUrl } from "@/util/Url"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
import { getDB } from "@/db/drizzle"

export const resetAffiliatePasswordServer = async ({
  affiliateId,
  orgId,
  password,
}: {
  affiliateId: string
  orgId: string
  password: string
}): Promise<MutationData> => {
  return handleAction("reset Affiliate Password", async () => {
    const hashed = await bcrypt.hash(password, 10)
    const db = await getDB()
    // 🔑 Update the credentials account password (not affiliate directly)
    const [updatedAccount] = await db
      .update(affiliateAccount)
      .set({ password: hashed })
      .where(
        and(
          eq(affiliateAccount.affiliateId, affiliateId),
          eq(affiliateAccount.provider, "credentials")
        )
      )
      .returning()

    if (!updatedAccount) {
      throw {
        status: 500,
        toast: "Affiliate credentials account not found",
      }
    }

    // 🔑 Fetch affiliate to normalize email & session payload
    const existingAffiliate = await db.query.affiliate.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.id, affiliateId), eq(a.organizationId, orgId)),
    })

    if (!existingAffiliate) {
      throw {
        status: 500,
        toast: "Affiliate not found",
      }
    }

    const sessionPayload = {
      id: existingAffiliate.id,
      email: existingAffiliate.email,
      type: existingAffiliate.type,
      orgId: existingAffiliate.organizationId,
    }
    const baseUrl = await getBaseUrl()
    const redirectUrl = buildAffiliateUrl({
      path: "dashboard/analytics",
      organizationId: orgId,
      baseUrl,
      partial: true,
    })
    // Sign JWT & set cookie
    const sessionToken = jwt.sign(sessionPayload, process.env.SECRET_KEY!, {
      expiresIn: "7d",
    })

    const cookieStore = await cookies()
    cookieStore.set(`affiliateToken-${orgId}`, sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    return { ok: true, redirectUrl }
  })
}
