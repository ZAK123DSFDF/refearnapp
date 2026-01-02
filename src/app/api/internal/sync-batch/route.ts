import { db } from "@/db/drizzle"
import { affiliateClick } from "@/db/schema"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  // 1. Security Check
  if (req.headers.get("x-internal-secret") !== process.env.INTERNAL_SECRET) {
    return new Response("Unauthorized", { status: 401 })
  }

  try {
    const { batch } = (await req.json()) as { batch: Record<string, string> }

    // 2. Transform the Redis strings back into Database Rows
    const entries = Object.entries(batch).map(([key, count]) => {
      const p = key.split(":::")
      return {
        affiliateLinkId: p[0],
        clickCount: Number(count),
        referrer: p[5],
        deviceType: p[6],
        browser: p[7],
        os: p[8],
        createdAt: new Date(`${p[2]}T${p[3].padStart(2, "0")}:00:00Z`),
      }
    })

    if (entries.length === 0) return NextResponse.json({ ok: true })

    // 3. Use Drizzle to save everything in one go
    // This is much faster than inserting one by one
    await db.insert(affiliateClick).values(entries)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Drizzle Sync Error:", error)
    return NextResponse.json({ error: "Failed to save" }, { status: 500 })
  }
}
