// src/app/api/organization/[orgId]/promotion-codes/[codeId]/settings/route.ts
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { AppError } from "@/lib/exceptions"
import { ExchangeRate } from "@/util/ExchangeRate"

export const GET = handleRoute(
  "Get Promotion Code Settings",
  async (req, { orgId, codeId }: { orgId: string; codeId: string }) => {
    const { searchParams } = new URL(req.url)
    const context = searchParams.get("context") || "admin"

    // 1. Auth & Get Org Data (which includes currency)
    const org =
      context === "team"
        ? await getTeamAuthAction(orgId)
        : await getOrgAuth(orgId)

    // 2. Get Exchange Rate
    const rate = await ExchangeRate(org.currency)

    const codeSettings = await db.query.promotionCodes.findFirst({
      where: and(
        eq(promotionCodes.id, codeId),
        eq(promotionCodes.organizationId, orgId)
      ),
      columns: {
        commissionType: true,
        commissionValue: true,
        commissionDurationValue: true,
        commissionDurationUnit: true,
        affiliateId: true,
      },
    })

    if (!codeSettings) throw new AppError({ status: 404, error: "Not found" })

    // 3. Convert value for the UI
    const convertedValue =
      codeSettings.commissionType === "FLAT_FEE"
        ? (Number(codeSettings.commissionValue) * rate).toString()
        : codeSettings.commissionValue

    return NextResponse.json({
      ok: true,
      data: {
        ...codeSettings,
        commissionValue: convertedValue,
        currency: org.currency,
      },
    })
  }
)
