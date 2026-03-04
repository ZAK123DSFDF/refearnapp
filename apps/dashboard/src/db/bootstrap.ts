import { BOOTSTRAP_QUERIES } from "@/db/schema-bootstrap"
import { sql } from "drizzle-orm"
import { db } from "@/db/drizzle"

for (const query of BOOTSTRAP_QUERIES) {
  console.log(`Executing: ${query.name}...`)
  await db.execute(sql.raw(query.sql))
}
