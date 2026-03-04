import { BOOTSTRAP_QUERIES } from "@/db/schema-bootstrap"
import { sql } from "drizzle-orm"
import { db } from "@/db/drizzle"

async function bootstrap() {
  console.log("🛠️  Starting Database Bootstrap...")

  for (const query of BOOTSTRAP_QUERIES) {
    try {
      // Use process.stdout to keep it on one line
      process.stdout.write(`  → Applying ${query.name}... `)
      await db.execute(sql.raw(query.sql))
      console.log("✅")
    } catch (error: any) {
      // Check if it's just a "relation already exists" error (Postgres code 42P07 or 42710)
      if (error.code === "42P07" || error.code === "42710") {
        console.log("⏭️  (Already exists, skipped)")
      } else {
        console.log("❌")
        console.error(`    Error in ${query.name}:`, error.message)
        // ONLY exit if it's a critical structural failure
        // process.exit(1);
      }
    }
  }

  console.log("🎯 Bootstrap Finished.")

  // IMPORTANT: Explicitly exit with 0 so the parent script knows we are done
  process.exit(0)
}

bootstrap().catch((err) => {
  console.error("Critical Bootstrap Failure:", err)
  process.exit(1)
})
