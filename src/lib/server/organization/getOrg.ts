import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Organization } from "@/lib/types/organization/orgAuth"
import { AppError } from "@/lib/exceptions"

export const getOrg = async (
  orgId: string,
  context: "public" | "affiliate" | "admin" | "team" = "public"
): Promise<Partial<Organization>> => {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, orgId),
    columns:
      context === "public"
        ? {
            name: true,
            logoUrl: true,
          }
        : context === "affiliate"
          ? {
              name: true,
              logoUrl: true,
              currency: true,
              commissionType: true,
              commissionValue: true,
            }
          : undefined,
  })

  if (!org)
    throw new AppError({
      status: 500,
      error: "failed to organization data",
      toast: "failed to fetch organization data",
    })
  return org
}
