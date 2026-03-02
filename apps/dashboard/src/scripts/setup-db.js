import { $ } from "bun"
import fs from "fs"
import path from "path"

const envPath = path.resolve(".env")

async function run() {
  console.log("\n🗄️  Voteflow: Database Setup & Sync\n")

  // --- STEP 1: ENV CHECK ---
  if (!fs.existsSync(envPath)) {
    console.log("📝 .env file not found. Creating a new one...")
    fs.writeFileSync(envPath, "") // Create empty file
  }

  let envContent = fs.readFileSync(envPath, "utf8")

  // Look for SUPABASE_DATABASE_URL specifically
  const dbUrlMatch = envContent.match(
    /^SUPABASE_DATABASE_URL=["']?(.*?)["']?$/m
  )
  let dbUrl = dbUrlMatch ? dbUrlMatch[1] : ""

  if (!dbUrl || dbUrl.trim() === "") {
    console.log("⚠️  SUPABASE_DATABASE_URL is missing.")
    const inputUrl = prompt(
      "👉 Paste your Supabase Connection String (Transaction mode preferred):"
    )

    if (!inputUrl || inputUrl.trim() === "") {
      console.error("❌ Error: Database URL is required to continue.")
      process.exit(1)
    }

    dbUrl = inputUrl.trim()

    // Replace existing key or append new one
    if (dbUrlMatch) {
      envContent = envContent.replace(
        /^SUPABASE_DATABASE_URL=.*$/m,
        `SUPABASE_DATABASE_URL="${dbUrl}"`
      )
    } else {
      // Ensure we don't bunch up lines if the file already has content
      const prefix =
        envContent.length > 0 && !envContent.endsWith("\n") ? "\n" : ""
      envContent += `${prefix}SUPABASE_DATABASE_URL="${dbUrl}"\n`
    }

    fs.writeFileSync(envPath, envContent.trim() + "\n")
    console.log("✅ .env updated with SUPABASE_DATABASE_URL.")
  } else {
    console.log("✅ SUPABASE_DATABASE_URL found in .env")
  }

  // --- STEP 2: DRIZZLE PUSH ---
  console.log("\n🔄 Syncing schema to database (Drizzle Push)...")
  try {
    // Note: Drizzle-kit usually reads from .env automatically,
    // but we run it via bun to ensure the env we just wrote is picked up.
    await $`npx drizzle-kit push`
    console.log("✅ Schema synchronization complete.")
  } catch (err) {
    console.error("❌ Database push failed. Check your Connection String.")
    process.exit(1)
  }

  // --- STEP 3: SEEDING ---
  console.log("\n🌱 Running currency seed script...")
  try {
    await $`bun src/db/currencySeed.ts` // NEW: Use Bun directly
    console.log("✅ Seeding complete.")
  } catch (err) {
    console.warn("⚠️  Seeding failed, but the database schema is likely okay.")
    console.error(err.message)
  }

  console.log("\n✨ ALL DONE! Your database is ready for Voteflow.\n")
}

run()
