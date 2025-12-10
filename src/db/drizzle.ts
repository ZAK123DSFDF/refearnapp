import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/db/schema"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
export async function getDB() {
  const { env } = await getCloudflareContext({ async: true })
  const d1 = (env as { DB: D1Database }).DB
  return drizzle(d1, { schema })
}
