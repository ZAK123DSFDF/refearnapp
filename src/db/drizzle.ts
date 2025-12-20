import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "@/db/schema"

// This uses the Transaction Pooler URL (6543)
const client = postgres(process.env.SUPABASE_DATABASE_URL!, { prepare: false })
export const db = drizzle(client, { schema })
