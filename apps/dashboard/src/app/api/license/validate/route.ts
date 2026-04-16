import { NextRequest, NextResponse } from "next/server"
import { Polar } from "@polar-sh/sdk"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"
import { polarConfig } from "@/lib/polarConfig"

const polar = new Polar({
  accessToken: polarConfig.accessToken,
  server: polarConfig.server,
})

export const POST = handleRoute("ValidateLicense", async (req: NextRequest) => {
  const isSelfHosted = process.env.NEXT_PUBLIC_SELF_HOSTED === "true"
  const isDev = process.env.NODE_ENV === "development"
  if (isSelfHosted && !isDev) {
    throw new AppError({
      status: 403,
      error: "FORBIDDEN",
      toast: "Access denied",
    })
  }

  const { key, activationId, expectedUserId } = await req.json()

  if (!key || !activationId || !expectedUserId) {
    throw new AppError({
      status: 422,
      error: "MISSING_FIELDS",
      toast: "Missing required fields",
    })
  }

  const result = await polar.licenseKeys
    .validate({
      key,
      organizationId: process.env.POLAR_ORGANIZATION_ID!,
      activationId,
    })
    .catch((err: any) => {
      const isExpired =
        err.statusCode === 404 &&
        err.error === "ResourceNotFound" &&
        err.detail?.toLowerCase().includes("expired")

      if (isExpired) {
        return {
          status: "revoked" as const,
          detail: "expired",
          tier: "PRO",
          isCustomError: true, // Add a flag to distinguish it easily
        }
      }
      throw err
    })
  if ("isCustomError" in result) {
    return NextResponse.json(result)
  }
  if (!result.activation) {
    throw new AppError({
      status: 401,
      error: "INVALID_ACTIVATION",
      toast: "Invalid activation key",
    })
  }

  if (result.activation.label !== expectedUserId) {
    throw new AppError({
      status: 403,
      error: "LICENSE_IN_USE",
      toast: "License is already in use by another device/user.",
    })
  }

  return NextResponse.json(result)
})
