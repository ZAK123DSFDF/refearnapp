#!/usr/bin/env bun
import { execSync } from "child_process"
import dotenv from "dotenv"
import fs from "fs"
import path from "path"

const envPath = path.resolve(process.cwd(), ".env")
if (!fs.existsSync(envPath)) {
  console.error(".env file not found!")
  process.exit(1)
}

dotenv.config({ path: envPath })

// Only push keys that are in this list
const SECRETS = ["SEED_SECRET", "CURRENCY_API_KEY", "ANOTHER_SECRET_KEY"]
const TOMLS = ["wrangler.admin.toml", "wrangler.toml"]

for (const toml of TOMLS) {
  console.log(`🔐 Pushing secrets to ${toml}`)
  for (const key of SECRETS) {
    const value = process.env[key]
    if (value) {
      console.log(`[${toml}] Setting secret: ${key}`)
      execSync(`wrangler secret put ${key} -c ${toml}`, {
        input: value,
        stdio: "inherit",
      })
    } else {
      console.warn(`[${toml}] Warning: ${key} not found in .env`)
    }
  }
}

console.log("✅ All secrets pushed successfully to all Workers!")
