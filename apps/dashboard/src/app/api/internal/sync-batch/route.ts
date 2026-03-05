import { db } from "@/db/drizzle"
import { affiliateClick, referrals } from "@/db/schema"
import { NextResponse } from "next/server"
import { handleRoute } from "@/lib/handleRoute"
import { AppError } from "@/lib/exceptions"

export const POST = handleRoute("Sync Click Batch", async (req) => {
  // 1. Security Check
  if (req.headers.get("x-internal-secret") !== process.env.INTERNAL_SECRET) {
    throw new AppError({
      error: "UNAUTHORIZED",
      toast: "Invalid sync secret",
      status: 401,
    })
  }
  const { batch, leads } = (await req.json()) as {
    batch: Record<string, string>
    leads: Record<string, string[]>
  }

  // --- PART A: PROCESS CLICKS ---
  if (batch && Object.keys(batch).length > 0) {
    const clickEntries = Object.entries(batch).map(([key, count]) => {
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
    if (clickEntries.length > 0) {
      await db.insert(affiliateClick).values(clickEntries)
    }
  }

  // --- PART B: PROCESS LEADS (SIGNUPS) ---
  if (leads && Object.keys(leads).length > 0) {
    for (const [organizationId, leadEntries] of Object.entries(leads)) {
      for (const entry of leadEntries) {
        const [email, code] = entry.split(":::")
        const link = await db.query.affiliateLink.findFirst({
          where: (t, { and, eq }) =>
            and(eq(t.id, code), eq(t.organizationId, organizationId)),
        })

        if (link) {
          await db
            .insert(referrals)
            .values({
              organizationId,
              affiliateId: link.affiliateId,
              affiliateLinkId: link.id,
              signupEmail: email.toLowerCase(),
              signedAt: new Date(),
              totalRevenue: "0.00",
              commissionEarned: "0.00",
              isSeenByAffiliate: false,
            })
            .onConflictDoNothing()
        } else {
          console.warn(
            `⚠️ Lead sync: Link code ${code} not found for org ${organizationId}`
          )
        }
      }
    }
  }

  return NextResponse.json({ ok: true })
})
