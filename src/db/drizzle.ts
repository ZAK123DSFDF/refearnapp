import { drizzle as drizzleD1 } from "drizzle-orm/d1"
import * as schema from "@/db/schema"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { createRemoteDb } from "@/db/createRemoteDb"

export async function getDB() {
  // if (process.env.NODE_ENV === "development") {
  //   return drizzleD1(createRemoteDb, { schema })
  // }

  // 2. PRODUCTION (Direct Worker Binding)
  console.log("Creating direct D1 database connection...")
  const { env } = await getCloudflareContext({ async: true })
  const d1 = (env as { DB: D1Database }).DB

  return drizzleD1(d1, { schema })
}
