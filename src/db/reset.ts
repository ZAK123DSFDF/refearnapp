import "dotenv/config"
import { createRemoteD1Client } from "@/db/d1ClientHelper"
async function simpleReset() {
  const client = createRemoteD1Client()
  await client.exec(`PRAGMA foreign_keys = OFF;`)
  const tablesResult = await client
    .prepare(
      `SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'`
    )
    .all()
  const tables = tablesResult.results as unknown as { name: string }[]

  if (tables && tables.length > 0) {
    for (const row of tables) {
      const tableName = row.name
      console.log(`Dropping table: ${tableName}`)
      await client.exec(`DROP TABLE IF EXISTS "${tableName}"`)
    }
  } else {
    console.log("No user tables found to drop.")
  }

  await client.exec(`PRAGMA foreign_keys = ON;`)
  console.log("✅ Reset complete: All user tables dropped.")
}

simpleReset()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Reset failed", err)
    process.exit(1)
  })
