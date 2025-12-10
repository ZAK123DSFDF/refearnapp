"use server"
import { organization } from "@/db/schema"
import { eq } from "drizzle-orm"
import { getDB } from "@/db/drizzle"

export async function getUserOrgs(userId: string) {
  const db = await getDB()
  return db.select().from(organization).where(eq(organization.userId, userId))
}
