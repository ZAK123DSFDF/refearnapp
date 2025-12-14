import { drizzle } from "drizzle-orm/d1"
import * as schema from "@/db/schema"
import { getCloudflareContext } from "@opennextjs/cloudflare"
import type { D1Database } from "@cloudflare/workers-types"
import { createRemoteD1Client } from "@/db/d1ClientHelper"
export async function getDB() {
  if (
    process.env.CLOUDFLARE_ACCOUNT_ID &&
    process.env.CLOUDFLARE_DATABASE_ID &&
    process.env.CLOUDFLARE_D1_TOKEN
  ) {
    const client = createRemoteD1Client()
    return drizzle(client, { schema })
  }
  try {
    const { env } = await getCloudflareContext({ async: true })
    const d1 = (env as { DB: D1Database }).DB
    console.log("Connecting via Worker binding...")
    return drizzle(d1, { schema })
  } catch (e) {
    console.error("Failed to get Cloudflare context, DB connection failed.")
    throw new Error(
      "Cannot connect to D1. Ensure environment variables are set or running in a Worker context."
    )
  }
}
