import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Organization } from "@/lib/types/organization/orgAuth"
import { AppError } from "@/lib/exceptions"

export const getOrg = async (orgId: string): Promise<Organization> => {
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, orgId),
  })

  if (!org) {
    throw new AppError({
      status: 500,
      error: "failed to organization data",
      toast: "failed to fetch organization data",
    })
  }

  return org
}
