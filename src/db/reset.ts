import { db } from "@/db/drizzle"
import { redis } from "@/lib/redis" // Import your redis client

async function simpleReset() {
  try {
    // 1. Reset PostgreSQL
    console.log("🐘 Resetting PostgreSQL...")
    await db.execute(`DROP SCHEMA IF EXISTS drizzle CASCADE`)
    await db.execute(`DROP SCHEMA IF EXISTS public CASCADE`)
    await db.execute(`CREATE SCHEMA public`)
    console.log("✅ Drizzle migrations reset complete")

    // 2. Reset Redis
    console.log("🧹 Clearing Redis...")
    await redis.flushdb()
    console.log("✅ Redis database cleared")
  } catch (error) {
    console.error("❌ Reset failed:", error)
    process.exit(1)
  } finally {
    // It's good practice to close the process if this is a standalone script
    process.exit(0)
  }
}

simpleReset().then(() => console.log("reset complete"))
