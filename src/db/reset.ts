import { getDB } from "@/db/drizzle"

async function simpleReset() {
  const db = await getDB()
  const client = db.$client // ← raw Cloudflare D1 client

  await client.exec(`PRAGMA foreign_keys = OFF;`)

  const tables = await client
    .prepare(`SELECT name FROM sqlite_master WHERE type='table'`)
    .all()

  for (const row of tables.results) {
    const tableName = row.name
    if (tableName !== "sqlite_sequence") {
      await client.exec(`DROP TABLE IF EXISTS "${tableName}"`)
    }
  }

  await client.exec(`PRAGMA foreign_keys = ON;`)

  console.log("Reset complete: All tables dropped.")
}

await simpleReset()
