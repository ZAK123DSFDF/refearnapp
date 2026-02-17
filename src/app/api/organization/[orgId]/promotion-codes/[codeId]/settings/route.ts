// src/app/api/organization/[orgId]/promotion-codes/[codeId]/settings/route.ts
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { getOrgAuth } from "@/lib/server/organization/GetOrgAuth"
import { getTeamAuthAction } from "@/lib/server/team/getTeamAuthAction"
import { db } from "@/db/drizzle"
import { promotionCodes } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { AppError } from "@/lib/exceptions"

export const GET = handleRoute(
  "Get Promotion Code Settings",
  async (req, { orgId, codeId }: { orgId: string; codeId: string }) => {
    const { searchParams } = new URL(req.url)
    const context = searchParams.get("context") || "admin"

    // 🛡️ Auth
    if (context === "team") {
      await getTeamAuthAction(orgId)
    } else {
      await getOrgAuth(orgId)
    }

    // 🔍 Fetch specific fields needed for the form
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

    if (!codeSettings) {
      throw new AppError({
        status: 404,
        error: "Promotion code not found",
        toast: "Promotion code not found",
      })
    }

    return NextResponse.json({ ok: true, data: codeSettings })
  }
)
