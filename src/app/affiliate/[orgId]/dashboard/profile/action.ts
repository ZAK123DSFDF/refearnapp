// app/actions/auth/getUser.ts
"use server"
import { ActionResult } from "@/lib/types/response"
import { SafeAffiliateWithCapabilities } from "@/lib/types/authAffiliate"
import { revalidatePath } from "next/cache"
import { getAffiliateOrganization } from "@/lib/server/GetAffiliateOrganization"
import { updateAffiliatePasswordAction } from "@/lib/server/updateAffiliatePassword"
import { validateAffiliatePasswordAction } from "@/lib/server/validateAffiliatePassword"
import { updateAffiliateProfileAction } from "@/lib/server/updateAffiliateProfile"
import { getAffiliateDataAction } from "@/lib/server/getAffiliateData"
import { getPayoutEmailMethod } from "@/lib/server/getPayoutEmailMethod"
import { cookies } from "next/headers"
import { getAffiliateAuthCapabilities } from "@/lib/server/getAffiliateAuthCapabilities"
import { getBaseUrl } from "@/lib/server/getBaseUrl"
import { buildAffiliateUrl } from "@/util/Url"
import { handleAction } from "@/lib/handleAction"

export const getAffiliateData = async (
  orgId: string
): Promise<ActionResult<SafeAffiliateWithCapabilities>> => {
  return handleAction("getAffiliateData", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    const { canChangeEmail, canChangePassword } =
      await getAffiliateAuthCapabilities(orgId)
    const affiliateData = await getAffiliateDataAction(decoded)
    return {
      ok: true,
      data: { ...affiliateData, canChangeEmail, canChangePassword },
    }
  })
}
export const getAffiliatePaymentMethod = async (
  orgId: string
): Promise<ActionResult<AffiliatePaymentMethod>> => {
  return handleAction("getAffiliatePaymentMethod", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    const paypalMethod = await getPayoutEmailMethod(decoded)
    return {
      ok: true,
      data: { paypalEmail: paypalMethod?.accountIdentifier ?? null },
    }
  })
}
export async function updateAffiliateProfile(
  orgId: string,
  data: {
    name?: string
    paypalEmail?: string
  }
) {
  return handleAction("updateAffiliateProfile", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    await updateAffiliateProfileAction(decoded, data)
    const baseUrl = await getBaseUrl()
    const revalidationPath = buildAffiliateUrl({
      path: "dashboard/profile",
      organizationId: orgId,
      baseUrl,
      partial: true,
    })
    revalidatePath(revalidationPath)
    return { ok: true }
  })
}

export async function validateCurrentPassword(
  orgId: string,
  currentPassword: string
) {
  return handleAction("Validate Current Password", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    await validateAffiliatePasswordAction(decoded, currentPassword)
    return { ok: true }
  })
}
export async function updateAffiliatePassword(
  orgId: string,
  newPassword: string
) {
  return handleAction("updateAffiliatePassword", async () => {
    const decoded = await getAffiliateOrganization(orgId)
    const { canChangePassword } = await getAffiliateAuthCapabilities(orgId)
    if (!canChangePassword) {
      throw { status: 403, toast: "This account cannot change password" }
    }
    await updateAffiliatePasswordAction(decoded, newPassword)

    return { ok: true }
  })
}
export async function logoutAction({
  affiliate,
  isTeam,
  orgId,
}: {
  affiliate?: boolean
  isTeam?: boolean
  orgId?: string
}) {
  return handleAction("logoutAction", async () => {
    const cookieStore = await cookies()

    if (affiliate && orgId) {
      cookieStore.delete(`affiliateToken-${orgId}`)
      const baseUrl = await getBaseUrl()
      const redirectUrl = buildAffiliateUrl({
        path: "login",
        organizationId: orgId,
        baseUrl,
        partial: true,
      })
      console.log("redirect url", redirectUrl)
      return { ok: true, redirectTo: redirectUrl }
    }

    if (isTeam && orgId) {
      cookieStore.delete(`teamToken-${orgId}`)
      return { ok: true, redirectTo: `/organization/${orgId}/teams/login` }
    }

    cookieStore.delete("organizationToken")
    return { ok: true, redirectTo: "/login" }
  })
}
