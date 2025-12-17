import { drizzle } from "drizzle-orm/d1"
import type { D1Database } from "@cloudflare/workers-types"
import { runDatabaseReset } from "@/db/seeds/runDatabaseReset"
import { runDatabaseSeed } from "@/db/seeds/runDatabaseSeed"
import { runCurrencySeed } from "@/db/seeds/runCurrencySeed"

// Extend the env type to include the secret
interface Env {
  DB: D1Database
  SEED_SECRET: string
  CURRENCY_API_KEY: string
}

export default {
  async fetch(req: Request, env: Env) {
    // --- 1. START/REQUEST RECEIVED ---
    console.log(`[START] Request received: ${req.url}`)
    const url = new URL(req.url)

    // Check path for debugging clarity
    console.log(`[ROUTE] Path: ${url.pathname}`)

    const seedSecret = req.headers.get("x-seed-secret")

    // --- 2. AUTHENTICATION CHECK ---
    if (seedSecret !== env.SEED_SECRET) {
      console.log(
        `[FAIL] Authentication failed. Secret received: ${seedSecret}`
      )
      return new Response("Forbidden", { status: 403 })
    }
    console.log("[AUTH] Authentication successful.")

    const db = drizzle(env.DB)

    // --- 3. ROUTING LOGIC ---
    if (url.pathname.endsWith("/seed")) {
      console.log("[ACTION] Executing SEED.")
      await runDatabaseSeed(db)
      return new Response("✅ Seed completed", { status: 200 })
    } else if (url.pathname.endsWith("/reset")) {
      console.log("[ACTION] Executing RESET.")
      // The console.logs inside runDatabaseReset will take over from here
      await runDatabaseReset(db)
      return new Response("♻️ Reset completed: Tables dropped", { status: 200 })
    } else if (url.pathname.endsWith("/currency")) {
      console.log("[ACTION] Executing CURRENCY update.")
      await runCurrencySeed(db, env.CURRENCY_API_KEY)
      return new Response("💵 Currency rates updated", { status: 200 })
    } else if (url.pathname.endsWith("/query")) {
      return db
    }
    console.log("[END] No matching action found.")
    return new Response("Admin Worker: Action Not Found", { status: 404 })
  },
}
