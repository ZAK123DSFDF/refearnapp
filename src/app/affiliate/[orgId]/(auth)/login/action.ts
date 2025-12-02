"use server"

import { db } from "@/db/drizzle"
import * as bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { sendVerificationEmail } from "@/lib/mail"
import { buildAffiliateUrl } from "@/util/Url"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { MutationData } from "@/lib/types/response"
import { handleAction } from "@/lib/handleAction"
export const LoginAffiliateServer = async ({
  email,
  password,
  organizationId,
  rememberMe = false,
}: {
  email: string
  password: string
  organizationId: string
  rememberMe?: boolean
}): Promise<MutationData> => {
  return handleAction("Login Affiliate Server", async () => {
    if (!email || !password || !organizationId) {
      throw {
        status: 400,
        error: "Email, password, and organization ID are required.",
        toast: "Please enter your login credentials.",
      }
    }

    // Find the affiliate by organization and email
    const existingAffiliate = await db.query.affiliate.findFirst({
      where: (a, { and, eq }) =>
        and(eq(a.email, email), eq(a.organizationId, organizationId)),
    })

    if (!existingAffiliate) {
      throw {
        status: 404,
        error: "Affiliate not found.",
        toast:
          "Invalid credentials. Please check your email, password, and organization.",
        fields: { email: "Affiliate not found in this organization" },
      }
    }

    // Find the affiliate account with provider = 'credentials'
    const affiliateAcc = await db.query.affiliateAccount.findFirst({
      where: (aa, { and, eq }) =>
        and(
          eq(aa.affiliateId, existingAffiliate.id),
          eq(aa.provider, "credentials")
        ),
    })

    if (!affiliateAcc || !affiliateAcc.password) {
      throw {
        status: 401,
        error: "Affiliate account not found.",
        toast: "Invalid credentials. No password found for this affiliate.",
      }
    }

    const validPassword = await bcrypt.compare(password, affiliateAcc.password)

    if (!validPassword) {
      throw {
        status: 401,
        error: "Invalid password.",
        toast: "Invalid credentials. Please check your password.",
        fields: { password: "Invalid password" },
      }
    }

    const token = jwt.sign(
      {
        id: existingAffiliate.id,
        email: existingAffiliate.email,
        type: existingAffiliate.type,
        organizationId: existingAffiliate.organizationId,
        rememberMe,
      },
      process.env.SECRET_KEY as string,
      { expiresIn: "15m" }
    )
    const baseUrl = await getBaseUrl()
    const verifyUrl = buildAffiliateUrl({
      path: "verify-login",
      organizationId,
      token,
      baseUrl,
    })
    const redirectUrl = buildAffiliateUrl({
      path: "checkEmail",
      organizationId,
      baseUrl,
    })
    if (process.env.NODE_ENV === "development") {
      await sendVerificationEmail(existingAffiliate.email, verifyUrl, "login")
      return {
        ok: true,
        toast: "Verification email sent",
        redirectUrl,
      }
    }
    return { ok: true, redirectUrl: verifyUrl }
  })
}
