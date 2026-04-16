import { NextRequest, NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { Polar } from "@polar-sh/sdk"
import { AppError } from "@/lib/exceptions"
import { polarConfig } from "@/lib/polarConfig"

const polar = new Polar({
  accessToken: polarConfig.accessToken,
  server: polarConfig.server,
})

export const POST = handleRoute(
  "DeactivatePolarAPI",
  async (req: NextRequest) => {
    if (process.env.NEXT_PUBLIC_SELF_HOSTED === "true") {
      return NextResponse.json({ ok: true })
    }

    const { activationId, key } = await req.json()

    if (!activationId || !key) {
      throw new AppError({
        status: 400,
        error: "MISSING_FIELDS",
        toast: "Missing license key or activation ID.",
      })
    }
    await polar.licenseKeys.deactivate({
      key: key,
      activationId: activationId,
      organizationId: process.env.POLAR_ORGANIZATION_ID!,
    })

    return NextResponse.json({ ok: true })
  }
)
