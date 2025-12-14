import type { DrizzleD1Database } from "drizzle-orm/d1"
import { sql } from "drizzle-orm"
import { tables } from "@/db/schema"
import { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core"

const tableObjects = Object.values(tables) as SQLiteTableWithColumns<any>[]

const allTableNames = tableObjects
  .map((table) => table.tableName)
  .filter((name): name is string => typeof name === "string")

export async function runDatabaseReset(
  db: DrizzleD1Database<Record<string, never>>
) {
  console.log("♻️ this is the start")

  const tablesToDrop = allTableNames.filter(
    (name) => name !== "__drizzle_migrations"
  )
  console.log("table filtered")
  await db.run(sql`PRAGMA foreign_keys = OFF;`)
  console.log("db run successful")
  // reverse for FK safety
  for (const tableName of [...tablesToDrop].reverse()) {
    console.log(`Dropping table: ${tableName}`)
    await db.run(sql`DROP TABLE IF EXISTS ${sql.identifier(tableName)};`)
  }
  console.log("for loop successful")
  await db.run(sql`PRAGMA foreign_keys = ON;`)
  console.log("✅ Reset execution completed.")
}
