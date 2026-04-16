import { NextRequest, NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { Polar } from "@polar-sh/sdk"
import { AppError } from "@/lib/exceptions"
import { polarConfig } from "@/lib/polarConfig"

const polar = new Polar({
  accessToken: polarConfig.accessToken,
  server: polarConfig.server,
})

// app/api/license/activate/route.ts
export const POST = handleRoute(
  "ActivateLicenseAPI",
  async (req: NextRequest) => {
    const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
    const isDev = process.env.NODE_ENV === "development"
    if (isSelfHosted && !isDev) {
      throw new AppError({
        status: 403,
        error: "FORBIDDEN",
        toast: "Access denied",
      })
    }
    const { ownerId, key, oldLicenseKey } = await req.json()
    if (!ownerId || !key) {
      throw new AppError({
        status: 400,
        error: "MISSING_REQUIRED_FIELDS",
        toast: "Organization ID and License Key are required.",
      })
    }
    if (oldLicenseKey && Array.isArray(oldLicenseKey)) {
      for (const old of oldLicenseKey) {
        if (old.key !== key) {
          await polar.licenseKeys.update({
            id: old.polarId,
            licenseKeyUpdate: { status: "revoked" },
          })
        }
      }
    }

    // 2. Activate new key on Polar
    const result = await polar.licenseKeys.activate({
      key,
      organizationId: process.env.POLAR_ORGANIZATION_ID!,
      label: ownerId,
    })
    if (!result) {
      throw new AppError({
        status: 500,
        error: "ACTIVATION_FAILED",
        toast: "Failed to activate the new license key.",
      })
    }
    return NextResponse.json({ data: result })
  }
)
