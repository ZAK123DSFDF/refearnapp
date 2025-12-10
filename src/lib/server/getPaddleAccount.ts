"use server"

import { getOrganizationById } from "@/services/getOrganizationById"
import { organizationPaddleAccount } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export const getPaddleAccount = async (orgId: string) => {
  const organizationRecord = await getOrganizationById(orgId)
  if (!organizationRecord) return null
  const db = await getDB()
  const [orgPaddleAccount] = await db
    .select()
    .from(organizationPaddleAccount)
    .where(eq(organizationPaddleAccount.orgId, organizationRecord.id))
    .limit(1)

  return orgPaddleAccount ?? null
}
