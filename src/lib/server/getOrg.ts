"use server"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { Organization } from "@/lib/types/orgAuth"
import { getDB } from "@/db/drizzle"

export const getOrg = async (orgId: string): Promise<Organization> => {
  const db = await getDB()
  const org = await db.query.organization.findFirst({
    where: eq(organization.id, orgId),
  })

  if (!org) {
    throw {
      status: 500,
      error: "failed to organization data",
      toast: "failed to fetch organization data",
    }
  }

  return org
}
