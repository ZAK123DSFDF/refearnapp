import { db } from "@/db/drizzle"
import { licenseKeys, licenseActivations, LicenseStatus } from "@/db/schema"
import { eq } from "drizzle-orm"
import { handleAction } from "@/lib/handleAction"
import { getOrgOwnerId } from "@/lib/server/organization/getOrgOwnerId"
import { CENTRAL_API_URL } from "@/lib/constants/centralDomain"

export async function getLicense(orgId: string) {
  if (process.env.NEXT_PUBLIC_SELF_HOSTED !== "true") return null

  const ownerId = await getOrgOwnerId(orgId)
  if (!ownerId) return null

  return await handleAction("GetLicenseSync", async () => {
    // Perform explicit left join
    const result = await db
      .select()
      .from(licenseKeys)
      .leftJoin(
        licenseActivations,
        eq(licenseKeys.id, licenseActivations.licenseId)
      )
      .where(eq(licenseKeys.userId, ownerId))

    const row = result[0]

    // If no license found
    if (!row) {
      return {
        ok: true,
        data: {
          isCommunity: true,
          isActive: true,
          isPro: false,
          isUltimate: false,
          activationId: null,
          tier: "FREE" as const,
          key: null,
        },
      }
    }

    const license = row.license_keys
    const activation = row.license_activations

    const now = new Date()
    const lastValidated = license.lastValidatedAt || new Date(0)
    const needsSync =
      now.getTime() - lastValidated.getTime() > 24 * 60 * 60 * 1000

    if (needsSync && activation) {
      const res = await fetch(`${CENTRAL_API_URL}/api/license/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: license.key,
          activationId: activation.activationId,
          expectedUserId: ownerId,
        }),
      })

      if (res.ok) {
        const remoteLicense = await res.json()
        const isRevoked = remoteLicense.status === "revoked"
        const localStatus: LicenseStatus =
          remoteLicense.status === "granted" ? "active" : "revoked"
        const finalExpiresAt = isRevoked
          ? new Date(0)
          : remoteLicense.expires_at
            ? new Date(remoteLicense.expires_at)
            : null
        await db
          .update(licenseKeys)
          .set({
            status: localStatus,
            tier: remoteLicense.tier,
            expiresAt: finalExpiresAt,
            lastValidatedAt: new Date(),
          })
          .where(eq(licenseKeys.id, license.id))
      }
    }

    const expiresAt = license.expiresAt ? new Date(license.expiresAt) : null
    let isExpired = false
    if (expiresAt) {
      isExpired = expiresAt < now
    }

    return {
      ok: true,
      data: {
        ...license,
        isCommunity: false,
        activationId: activation?.activationId ?? null,
        isActive: license.status === "active" && !isExpired,
        isPro: license.tier === "PRO",
        isUltimate: license.tier === "ULTIMATE",
      },
    }
  })
}
type GetLicenseReturn = Awaited<ReturnType<typeof getLicense>>
export type UserLicense =
  NonNullable<GetLicenseReturn> extends { data: infer T } ? T : null
