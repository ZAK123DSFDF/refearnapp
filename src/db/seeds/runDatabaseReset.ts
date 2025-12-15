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
  const tables = await db.all<{ name: string }>(sql`
    SELECT name
    FROM sqlite_master
    WHERE type='table'
      AND name NOT LIKE 'sqlite_%'
      AND name != '__drizzle_migrations'
  `)

  await db.run(sql`PRAGMA foreign_keys = OFF;`)

  for (const { name } of tables.reverse()) {
    await db.run(sql.raw(`DROP TABLE IF EXISTS "${name}"`))
  }

  await db.run(sql`PRAGMA foreign_keys = ON;`)
}
