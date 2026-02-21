import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import { ActionResult } from "@/lib/types/organization/response"
import { OrgData } from "@/lib/types/organization/organization"
import { AppError } from "@/lib/exceptions"

export const getOrgData = async (
  orgId: string,
  isTeam: boolean = false
): Promise<ActionResult<OrgData>> => {
  const cookieStore = await cookies()
  const tokenKey = isTeam ? `teamToken-${orgId}` : "organizationToken"
  const token = cookieStore.get(tokenKey)?.value

  if (!token) {
    throw new AppError({
      status: 401,
      error: "Unauthorized",
      toast: "You must be logged in.",
    })
  }

  const decoded = jwt.decode(token) as { id: string }
  if (!decoded?.id) {
    throw new AppError({
      status: 400,
      error: "Invalid token",
      toast: "Session invalid or expired.",
    })
  }

  // Fetch organization data
  const org = await db.query.organization.findFirst({
    where: (org, { eq }) => eq(org.id, orgId),
  })

  if (!org) {
    throw new AppError({
      status: 404,
      error: "Organization not found",
      toast: "The requested organization does not exist.",
    })
  }
  return {
    ok: true,
    data: {
      id: org.id,
      name: org.name,
      description: org.description,
      websiteUrl: org.websiteUrl,
      logoUrl: org.logoUrl ?? "",
      supportEmail: org.supportEmail ?? "",
      openGraphUrl: org.openGraphUrl ?? "",
      referralParam: org.referralParam as "ref" | "via" | "aff",
      cookieLifetimeValue: org.cookieLifetimeValue,
      cookieLifetimeUnit: org.cookieLifetimeUnit as
        | "day"
        | "week"
        | "month"
        | "year",
      commissionType: org.commissionType as "PERCENTAGE" | "FLAT_FEE",
      commissionValue: String(org.commissionValue ?? "0.00"),
      commissionDurationValue: org.commissionDurationValue,
      commissionDurationUnit: org.commissionDurationUnit as
        | "day"
        | "week"
        | "month"
        | "year",
      currency: (org.currency ?? "USD") as
        | "USD"
        | "EUR"
        | "GBP"
        | "CAD"
        | "AUD",
      attributionModel: org.attributionModel,
    },
  }
}
