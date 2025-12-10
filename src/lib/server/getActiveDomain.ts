// lib/server/getActiveDomain.ts
"use server"
import { websiteDomain } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function getActiveDomain(orgId: string) {
  const db = await getDB()
  const domain = await db.query.websiteDomain.findFirst({
    where: and(
      eq(websiteDomain.orgId, orgId),
      eq(websiteDomain.isActive, true),
      eq(websiteDomain.isRedirect, false)
    ),
  })

  if (!domain) throw { status: 404, error: "Active domain not found" }
  return domain
}
