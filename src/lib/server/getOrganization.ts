import { getDB } from "@/db/drizzle"

export const getOrganization = async (orgId: string) => {
  const db = await getDB()
  const org = await db.query.organization.findFirst({
    where: (o, { eq }) => eq(o.id, orgId),
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
