import { getDB } from "@/db/drizzle"

async function simpleReset() {
  const db = await getDB()
  await db.execute(`DROP SCHEMA IF EXISTS drizzle CASCADE`)
  await db.execute(`DROP SCHEMA IF EXISTS public CASCADE`)
  await db.execute(`CREATE SCHEMA public`)
  console.log("Drizzle migrations reset complete")
}
await simpleReset()
