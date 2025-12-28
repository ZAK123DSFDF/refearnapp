"use server"
import { cookies } from "next/headers"
import jwt from "jsonwebtoken"
import { db } from "@/db/drizzle"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { OrgAuthResult } from "@/lib/types/orgAuth"

export async function getOrgAuth(orgId: string): Promise<OrgAuthResult> {
  const cookieStore = await cookies()
  const token = cookieStore.get("organizationToken")?.value
  if (!token) throw { status: 401, toast: "Unauthorized" }

  const { id: userId } = jwt.decode(token) as { id: string }
  const org = await db
    .select({
      domain: organization.websiteUrl,
      param: organization.referralParam,
      currency: organization.currency,
      userId: organization.userId,
    })
    .from(organization)
    .where(eq(organization.id, orgId))
    .then((r) => r[0])
  if (!org) throw { status: 404, toast: "Org not found" }
  if (org.userId !== userId) throw { status: 403, toast: "Forbidden" }
  return org
}
